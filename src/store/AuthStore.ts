import { makeAutoObservable } from 'mobx';
import { User } from '../utils/types';

class AuthStore {
  accessToken: string | null = null;

  refreshToken: string | null = null;

  constructor(initialUser?: User | null) {
    makeAutoObservable(this);
    if (initialUser) {
      this.accessToken = initialUser.idToken;
      this.refreshToken = initialUser.refreshToken;
    }
  }

  get isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

export default AuthStore;
