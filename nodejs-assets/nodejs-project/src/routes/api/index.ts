import {
  h5pAjaxExpressRouter,
  libraryAdministrationExpressRouter,
} from '@lumieducation/h5p-express';
import {
  cacheImplementations,
  fsImplementations,
  H5PEditor,
  H5PPlayer,
  IH5PConfig,
} from '@lumieducation/h5p-server';
import express from 'express';
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join } from 'node:path';
import createH5pRoute from './h5p';

const h5pConfig: IH5PConfig = {
  contentFilesUrlPlayerOverride: '',
  libraryConfig: undefined,
  contentUserStateSaveInterval: false,
  setFinishedEnabled: false,
  ajaxUrl: '/ajax',
  baseUrl: '/h5p',
  contentFilesUrl: '/content',
  contentHubContentEndpoint: '',
  contentHubEnabled: false,
  contentHubMetadataEndpoint: '',
  contentHubMetadataRefreshInterval: 86400000,
  contentTypeCacheRefreshInterval: 86400000,
  contentUserDataUrl: '/contentUserData',
  contentWhitelist:
    'json png jpg jpeg gif bmp tif tiff svg eot ttf woff woff2 otf webm mp4 ogg mp3 m4a wav txt pdf rtf doc docx xls xlsx ppt pptx odt ods odp xml csv diff patch swf md textile vtt webvtt gltf glb',
  coreApiVersion: { major: 1, minor: 27 },
  coreUrl: '/core',
  customization: {
    global: {
      editor: { scripts: [], styles: [] },
      player: { scripts: [], styles: [] },
    },
  },
  disableFullscreen: false,
  downloadUrl: '/download',
  editorAddons: {
    'H5P.CoursePresentation': ['H5P.MathDisplay'],
    'H5P.InteractiveVideo': ['H5P.MathDisplay'],
    'H5P.DragQuestion': ['H5P.MathDisplay'],
  },
  editorLibraryUrl: '/editor',
  enableLrsContentTypes: true,
  exportMaxContentPathLength: 255,
  fetchingDisabled: 0,
  h5pVersion: '1.24-master',
  hubContentTypesEndpoint: 'https://api.h5p.org/v1/content-types/',
  hubRegistrationEndpoint: 'https://api.h5p.org/v1/sites',
  installLibraryLockMaxOccupationTime: 30000,
  installLibraryLockTimeout: 60000,
  librariesUrl: '/libraries',
  libraryWhitelist: 'js css',
  lrsContentTypes: ['H5P.Questionnaire', 'H5P.FreeTextQuestion'],
  maxFileSize: 2147483648,
  maxTotalSize: 2147483648,
  paramsUrl: '/params',
  platformName: 'Lumi Player',
  platformVersion: '0.1',
  playerAddons: undefined,
  playUrl: '/play',
  proxy: undefined,
  sendUsageStatistics: false,
  setFinishedUrl: '/setFinished',
  siteType: 'local',
  temporaryFileLifetime: 60000,
  temporaryFilesUrl: '/temp-files',
  uuid: '',
  async load() {
    return h5pConfig;
  },
  // eslint-disable-next-line no-empty-function
  async save() {},
};

const createLogger = (logFilePath: string) => (message: string) => {
  try {
    appendFileSync(logFilePath, `${new Date().toISOString()} ${message}\n`);
  } catch {
    // Ignore logging errors to avoid breaking server startup.
  }
  try {
    process.stderr.write(`[h5p-server] ${message}\n`);
  } catch {
    // Ignore log stream errors to avoid breaking server startup.
  }
};

const resolveBundledLibraryPath = (
  documentDirectory: string,
  bundleDirectory: string | undefined,
  log: (message: string) => void,
) => {
  const candidates = [
    join(__dirname, '..', '..', '..', '..', 'assets', 'h5p', 'libraries'),
    join(documentDirectory, 'assets', 'h5p', 'libraries'),
    join(documentDirectory, 'nodejs-project', 'assets', 'h5p', 'libraries'),
  ];

  if (bundleDirectory) {
    candidates.unshift(
      join(bundleDirectory, 'nodejs-project', 'assets', 'h5p', 'libraries'),
      join(bundleDirectory, 'assets', 'h5p', 'libraries'),
    );
  }

  let resolvedPath: string | undefined;
  candidates.forEach(candidate => {
    const exists = existsSync(candidate);
    log(`seed: candidate=${candidate} exists=${exists}`);
    if (!resolvedPath && exists) {
      resolvedPath = candidate;
    }
  });

  return resolvedPath;
};

const seedBundledLibraries = (
  libraryPath: string,
  documentDirectory: string,
  bundleDirectory: string | undefined,
  log: (message: string) => void,
) => {
  const bundledLibraryPath = resolveBundledLibraryPath(
    documentDirectory,
    bundleDirectory,
    log,
  );

  if (!bundledLibraryPath) {
    log('seed: no bundled library path found');
    return;
  }

  let copiedCount = 0;
  const copyMissingEntries = (sourceDir: string, targetDir: string) => {
    mkdirSync(targetDir, { recursive: true });
    readdirSync(sourceDir, { withFileTypes: true }).forEach(entry => {
      const sourcePath = join(sourceDir, entry.name);
      const targetPath = join(targetDir, entry.name);

      if (entry.isDirectory()) {
        copyMissingEntries(sourcePath, targetPath);
      } else if (!existsSync(targetPath) || !statSync(targetPath).isFile()) {
        copyFileSync(sourcePath, targetPath);
        copiedCount += 1;
      }
    });
  };

  copyMissingEntries(bundledLibraryPath, libraryPath);
  log(`seed: copiedFiles=${copiedCount}`);
};

export default function createApiRoute({
  cacheDirectory,
  documentDirectory,
  bundleDirectory,
}: {
  cacheDirectory: string;
  documentDirectory: string;
  bundleDirectory?: string;
}) {
  const libraryPath = join(documentDirectory, 'libraries');
  const contentPath = join(documentDirectory, 'content');
  const logFilePath = join(documentDirectory, 'h5p-server.log');
  const log = createLogger(logFilePath);

  // TODO: use async api later
  mkdirSync(libraryPath, { recursive: true });
  mkdirSync(contentPath, { recursive: true });
  log('server: starting H5P API routes');
  log(`server: libraryPath=${libraryPath}`);
  log(`server: contentPath=${contentPath}`);
  seedBundledLibraries(libraryPath, documentDirectory, bundleDirectory, log);

  const router = express.Router();
  router.use('/api/v1/h5p', express.static(libraryPath));
  const config = h5pConfig;
  const libStorage = new fsImplementations.FileLibraryStorage(libraryPath);
  const editor = new H5PEditor(
    new fsImplementations.InMemoryStorage(),
    config,
    new cacheImplementations.CachedLibraryStorage(libStorage),
    new fsImplementations.FileContentStorage(contentPath),
    new fsImplementations.DirectoryTemporaryFileStorage(cacheDirectory),
  );

  editor.setRenderer(model => model);

  const h5pPlayer = new H5PPlayer(
    editor.libraryStorage,
    editor.contentStorage,
    config,
  );
  h5pPlayer.setRenderer(c => c);

  router.use(
    editor.config.baseUrl,
    // FIXXME: invalid directories, as in lumi app:
    h5pAjaxExpressRouter(editor, '/tmp', '/tmp'),
  );

  // TODO: check whether we need this:
  router.use('/api/v1/libraries', libraryAdministrationExpressRouter(editor));

  router.use(
    '/api/v1/h5p',
    createH5pRoute({
      h5pEditor: editor,
      h5pPlayer,
    }),
  );
  return router;
}
