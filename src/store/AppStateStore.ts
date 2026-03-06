import { makeAutoObservable } from 'mobx';
import { User } from '../utils/types';
import persistStore from './PersistStore';

export interface AppState {
  introSeen: boolean;
  role: string;
  user: User;
}

class AppStateStore {
  introSeen = false;

  role: string = '';

  user: User | null = null;

  constructor(persistanceKey: string | undefined) {
    makeAutoObservable(this, {
      isTeacher: false,
    });
    if (persistanceKey) {
      persistStore(this, ['introSeen', 'role', 'user'], persistanceKey);
    }
  }

  setUser(user: User): void {
    this.user = user;
  }

  clearUser() {
    this.user = null;
  }

  clearIntroSeen() {
    this.introSeen = false;
  }

  setIntroSeen(introSeen: boolean): void {
    this.introSeen = introSeen;
  }

  clearRole() {
    this.role = '';
  }

  setRole(role: string): void {
    this.role = role;
  }

  isTeacher(): boolean {
    return this.role === 'Teacher';
  }
}

export default AppStateStore;
