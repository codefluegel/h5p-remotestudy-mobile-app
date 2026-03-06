import 'dotenv/config';
import util from 'node:util';
import os from 'node:os';
import fs from 'node:fs';
import { join } from 'node:path';

import ServerApplication from './serverApplication';

try {
  // needed for axios which tries to use fetch api, causing the iOS app to crash
  // TODO: check implications
  process.setUncaughtExceptionCaptureCallback(console.warn);
} catch (e) {
  console.warn('error setting uncaught exception handler', e);
}

const startRnBridge = () => {
  // on mobule, there is a rn-bridge packed we need to
  // communicate. However, we also want to run the server on dev pc
  // for development without the bridge.
  // eslint-disable-next-line
  const rnBridge = require('rn-bridge');

  const servers = new Map();

  // Echo every message received from react-native.
  rnBridge.channel.on('message', async (msg: unknown) => {
    const messageObject = Object(msg);
    if (messageObject.type === 'createServer') {
      // create a new server instance
      const server = new ServerApplication(
        messageObject.cacheDirectory,
        messageObject.documentDirectory,
        messageObject.bundleDirectory,
      );
      servers.set(messageObject.instanceId, server);
    } else if (messageObject.type === 'getServerUrl') {
      const server = servers.get(messageObject.instanceId);
      if (server) {
        const url = await server.getServerUrl();
        rnBridge.channel.send({
          type: 'serverUrl',
          instanceId: messageObject.instanceId,
          url,
        });
      } else {
        console.warn(
          `getServerUrl: Server with instance id ${messageObject.instanceId} not found`,
        );
      }
    }

    // TODO: remove this, just for debug
    rnBridge.channel.send(msg);
  });

  // override logging if we have a rn bridge
  const methods = ['log', 'info', 'debug', 'warn', 'error', 'trace'] as const;
  methods.forEach(method => {
    const orig = console[method];
    console[method] = (...args: unknown[]) => {
      orig(...args);
      rnBridge.channel.send({
        type: 'logging',
        level: method,
        message: util.format(args),
      });
    };
  });
};

try {
  startRnBridge();
} catch {
  console.warn(
    'You are (hopefully) running this locally for testing. If this is logged on a local mobile instance we have a problem...',
  );

  const cacheDirectory = join(os.tmpdir(), 'h5p', 'cache');
  fs.mkdirSync(cacheDirectory, { recursive: true });

  const documentDirectory = join(os.tmpdir(), 'h5p', 'documents');
  fs.mkdirSync(documentDirectory, { recursive: true });

  // in this case, start a local server
  const serverApplication = new ServerApplication(
    cacheDirectory,
    documentDirectory,
    undefined,
    Number(process.env.PORT),
  );
  serverApplication
    .getServerUrl()
    .then(url => console.log('listenting on ', url));
}
