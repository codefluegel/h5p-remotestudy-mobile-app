import express from 'express';

import createApiRoute from './api';

export default function createBaseRoute({
  cacheDirectory,
  documentDirectory,
  bundleDirectory,
}: {
  cacheDirectory: string;
  documentDirectory: string;
  bundleDirectory?: string;
}) {
  const router = express.Router();
  router.use(
    '/',
    createApiRoute({ cacheDirectory, documentDirectory, bundleDirectory }),
  );
  return router;
}
