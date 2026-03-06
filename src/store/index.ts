import { reaction } from 'mobx';
import AuthService from '../services/AuthService';
import { configureClientAuth } from '../services/apiClient';
import AppStateStore from './AppStateStore';
import AuthStore from './AuthStore';
import CourseStore from './CourseStore';

export type RootStoreOpts = {
  appStateStorePersistanceKey?: string;
  coursesStorePersistanceKey?: string;
};

export default class RootStore {
  public appStateStore: AppStateStore;

  public courseStore: CourseStore;

  public authStore: AuthStore;

  public authService: AuthService;

  constructor(opts: RootStoreOpts) {
    this.appStateStore = new AppStateStore(opts.appStateStorePersistanceKey);
    this.courseStore = new CourseStore(opts.coursesStorePersistanceKey);

    this.authStore = new AuthStore();

    this.authService = new AuthService(this.appStateStore, this.courseStore);

    configureClientAuth(this.authStore, this.authService);

    reaction(
      () => this.appStateStore.user,
      user => {
        if (user && user.idToken && user.refreshToken) {
          this.authStore.setTokens(user.idToken, user.refreshToken);
        } else if (!user) {
          this.authStore.clearTokens();
        }
      },
      { fireImmediately: true },
    );
  }
}
