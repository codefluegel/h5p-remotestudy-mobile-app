import express from 'express';
import { join } from 'node:path';
import createRouter from './routes';
import defaultUser from './defaultUser';

const LOCAL_IP = '127.0.0.1';

export default class ServerApplication {
  readonly app;

  private server;

  constructor(
    private cacheDirectory: string,
    private documentDirectory: string,
    private bundleDirectory?: string,
    port?: number,
    // additional static content to be served
    private staticServeDirectory?: string,
  ) {
    this.app = express();
    this.server = this.app.listen(
      // port only used for local development and use with electron
      port ?? 0,
      port ? '0.0.0.0' : LOCAL_IP,
    );

    this.setupRoutes();
  }

  private setupRoutes() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use((req, _, next) => {
      Object.assign(req, {
        user: defaultUser,
      });
      next();
    });

    this.app.use(
      '/',
      createRouter({
        cacheDirectory: this.cacheDirectory,
        documentDirectory: this.documentDirectory,
        bundleDirectory: this.bundleDirectory,
      }),
    );

    this.app.use(express.static(join(__dirname, '..', 'assets')));
    if (this.staticServeDirectory) {
      this.app.use(express.static(this.staticServeDirectory));
    }
  }

  getServerUrl() {
    return new Promise<string>(resolve => {
      const listener = () => {
        this.server.off('listening', listener);
        const address = this.server.address();
        // TODO: error handling when address() returns null?
        const url =
          typeof address === 'string'
            ? address
            : `http://${LOCAL_IP}:${address?.port}`;
        resolve(url);
      };
      // for initialization
      this.server.on('listening', listener);
      if (this.server.address()) {
        listener();
      }
    });
  }
}
