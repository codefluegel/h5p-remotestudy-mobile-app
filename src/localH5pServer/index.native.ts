import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { makeObservable, observable, runInAction, when } from 'mobx';
import nodejs from 'nodejs-mobile-react-native';
import LocalH5pServerBase from './H5pServerBase';

export { ContentMetadata } from './H5pServerBase';

nodejs.start('build/main.js');

const logLevels = {
  log: true,
  info: true,
  debug: true,
  warn: true,
  error: true,
  trace: true,
} as const;

interface ServerUrlMessage {
  type: 'serverUrl';
  instanceId: string;
  url: string;
}

interface LoggingMessage {
  type: 'logging';
  instanceId: string;
  level: keyof typeof logLevels;
  message: string;
}

const isServerUrlMessage = (message: unknown): message is ServerUrlMessage => {
  const messageObject = Object(message);
  return (
    message === messageObject &&
    messageObject.type === 'serverUrl' &&
    typeof messageObject.instanceId === 'string' &&
    typeof messageObject.url === 'string'
  );
};

const isLoggingMessage = (message: unknown): message is LoggingMessage => {
  const messageObject = Object(message);
  return (
    message === messageObject &&
    messageObject.type === 'logging' &&
    typeof messageObject.instanceId === 'string' &&
    Object.keys(logLevels).includes(messageObject.level) &&
    typeof messageObject.message === 'string'
  );
};

// logs
nodejs.channel.addListener('message', (message: unknown) => {
  if (isLoggingMessage(message)) {
    console[message.level]('NodeJS LOG:', message.message);
  }
});

export default class LocalH5pServer extends LocalH5pServerBase {
  constructor() {
    super();
    makeObservable<LocalH5pServer, 'localServerUrl'>(this, {
      localServerUrl: observable,
    });

    const cacheUri = FileSystem.Paths.cache?.uri;
    const documentUri = FileSystem.Paths.document?.uri;
    const bundleUri =
      (FileSystem as { bundleDirectory?: string }).bundleDirectory ??
      (FileSystem as { Paths?: { bundle?: { uri?: string } } }).Paths?.bundle
        ?.uri ??
      null;

    nodejs.channel.send({
      type: 'createServer',
      instanceId: this.instanceId,
      cacheDirectory: cacheUri ? new URL(cacheUri).pathname : cacheUri,
      documentDirectory: documentUri
        ? new URL(documentUri).pathname
        : documentUri,
      bundleDirectory: bundleUri ? new URL(bundleUri).pathname : bundleUri,
    });
    // listen to messages from nodejs
    nodejs.channel.addListener('message', (message: unknown) => {
      if (
        isServerUrlMessage(message) &&
        message.instanceId === this.instanceId
      ) {
        runInAction(() => {
          this.localServerUrl = message.url;
        });
      }
    });
  }

  private instanceId = Crypto.randomUUID();

  private localServerUrl = '';

  protected async getUrl() {
    if (!(await super.getUrl())) {
      if (!this.localServerUrl) {
        // trigger sending server url
        nodejs.channel.send({
          type: 'getServerUrl',
          instanceId: this.instanceId,
        });
      }
      await when(() => !!this.localServerUrl);
      return this.localServerUrl;
    }
    return super.getUrl();
  }
}
