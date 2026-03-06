import { pipeline } from 'node:stream/promises';
import { readFile } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { rootCertificates } from 'node:tls';
import { Agent } from 'node:https';
import {
  H5PEditor,
  H5PPlayer,
  IPlayerModel,
  IContentMetadata,
  LibraryName,
} from '@lumieducation/h5p-server';
import express from 'express';
import { file } from 'tmp-promise';
import axios, { AxiosInstance } from 'axios';
import { createHash } from 'node:crypto';
import yauzl from 'yauzl-promise';
import { join } from 'node:path';
import defaultUser from '../../../defaultUser';

let axiosInstanceCache: AxiosInstance | undefined;

const getAxiosInstance = async () => {
  if (!axiosInstanceCache) {
    try {
      const additionalCaCertificatePath = join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'assets',
        'extra-ca.crt',
      );
      axiosInstanceCache = axios.create({
        httpsAgent: new Agent({
          ca: [
            ...rootCertificates,
            await readFile(additionalCaCertificatePath, 'utf-8'),
          ],
        }),
      });
    } catch {
      // possibly the instance was created in the meantime by another call
      if (!axiosInstanceCache) {
        axiosInstanceCache = axios.create({});
      }
    }
  }
  return axiosInstanceCache;
};

function getUbernameFromH5pJson(h5pJson: IContentMetadata | undefined): string {
  const library = (h5pJson?.preloadedDependencies || []).find(
    dependency => dependency.machineName === h5pJson?.mainLibrary,
  );
  if (!library) {
    return '';
  }
  return LibraryName.toUberName(library, { useWhitespace: true });
}

// copied from lumi:
function H5PPlayerHTMLRenderer(model: IPlayerModel): string {
  return `<!doctype html>
    <html class="h5p-iframe">
    <head>
        <meta charset="utf-8">
        ${model.styles
          .map(style => `<link rel="stylesheet" href="${style}"/>`)
          .join('\n    ')}
        ${model.scripts
          .map(script => `<script src="${script}"></script>`)
          .join('\n    ')}
        <script>
            window.H5PIntegration = ${JSON.stringify(
              model.integration,
              null,
              2,
            )};
        </script>
    </head>
    <body>
        <div class="h5p-content" data-content-id="${model.contentId}"></div> 
    </body>
    </html>`;
}

async function copyStreamToTempfile(stream: Parameters<typeof pipeline>[0]) {
  let tempFile;
  try {
    tempFile = await file();
    const tempFileStream = createWriteStream(tempFile.path);
    await pipeline(stream, tempFileStream);
    return tempFile;
  } catch (e) {
    if (tempFile) {
      await tempFile
        .cleanup()
        .catch(cleanupError =>
          console.warn('cannot cleanup tempfile', cleanupError),
        );
    }
    throw e;
  }
}

function getFileChecksum(filePath: string) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha1');
    const stream = createReadStream(filePath);

    stream.on('error', reject);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => {
      const digest = hash.digest('hex');
      resolve(digest);
    });
  });
}

export default function createH5pRoute({
  h5pEditor,
  h5pPlayer,
}: {
  h5pEditor: H5PEditor;
  h5pPlayer: H5PPlayer;
}) {
  const router = express.Router();
  router.get(
    '/:contentId/data',
    async (req: express.Request, res: express.Response) => {
      const { contentId } = req.params;
      try {
        const content = await h5pEditor.getContent(contentId);
        console.log(`sending package data for contentId ${contentId}`);
        res.status(200).json(content);
      } catch (error: unknown) {
        console.warn(error);
        res.status(404).end();
      }
    },
  );

  router.delete('/:contentId', async (req, res) => {
    try {
      const { contentId } = req.params;
      await h5pEditor.deleteContent(contentId, defaultUser);
      res.sendStatus(200);
    } catch (e) {
      console.warn(e);
      // TODO: refine error codes
      res.sendStatus(404);
    }
  });

  router.get('/:contentId/metadata', async (req, res) => {
    const { contentId } = req.params;
    try {
      const content = await h5pEditor.getContent(contentId);
      res.status(200).json(content.h5p);
    } catch (error: unknown) {
      console.warn(error);
      res.status(404).end();
    }
  });

  router.get('/:contentId/play', async (req, res) => {
    try {
      const content = (await h5pPlayer.render(
        req.params.contentId,
        defaultUser,
      )) as IPlayerModel;

      res.send(H5PPlayerHTMLRenderer(content));
      res.status(200).end();
    } catch (error) {
      res.status(500).end(Object(error).message);
    }
  });

  router.post(`/`, async (req, res) => {
    async function addContentToH5p(filePath: string) {
      const { metadata, parameters } = await h5pEditor.uploadPackage(
        filePath,
        defaultUser,
      );
      return h5pEditor.saveOrUpdateContent(
        // @ts-expect-error wrong type spec in library
        undefined,
        parameters,
        metadata,
        getUbernameFromH5pJson(metadata),
        defaultUser,
      );
    }

    const cleanupFiles = [];
    try {
      // add package
      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance.get(req.body.url, {
        responseType: 'stream',
      });
      const isBundle = (response.headers['content-type'] ?? req.body.url)
        .toLowerCase()
        .endsWith('zip');

      const tempFile = await copyStreamToTempfile(response.data);
      cleanupFiles.push(tempFile);

      const addedH5pEntries = [];

      if (isBundle) {
        const zip = await yauzl.open(tempFile.path);
        try {
          let entry = await zip.readEntry();
          while (entry != null) {
            if (entry.filename.toLowerCase().endsWith('.h5p')) {
              const h5pFile = await copyStreamToTempfile(
                await entry.openReadStream(),
              );
              cleanupFiles.push(h5pFile);
              const hash = await getFileChecksum(h5pFile.path);
              const id = await addContentToH5p(h5pFile.path);
              addedH5pEntries.push({ id, hash });
            }
            entry = await zip.readEntry();
          }
        } finally {
          zip.close().catch(() => console.warn('Cannot close zip file'));
        }
      } else {
        const hash = await getFileChecksum(tempFile.path);
        const id = await addContentToH5p(tempFile.path);
        addedH5pEntries.push({ id, hash });
      }

      res.status(200);
      res.json(addedH5pEntries);
    } catch (error) {
      console.warn('upload error:', error);
      res.status(500).end(Object(error).message);
    } finally {
      await Promise.allSettled(
        cleanupFiles.map(fileToCleanup => fileToCleanup.cleanup()),
      );
    }
  });
  return router;
}
