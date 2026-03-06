import axios from 'axios';
import { router } from 'expo-router';
import type AppStateStore from '../store/AppStateStore';
import type CourseStore from '../store/CourseStore';
import { User } from '../utils/types';

const authApiClient = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    'https://europe-west1-h5p-remote-study-dev.cloudfunctions.net/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

class AuthService {
  private appStateStore: AppStateStore;

  private courseStore: CourseStore;

  constructor(appStateStore: AppStateStore, courseStore: CourseStore) {
    this.appStateStore = appStateStore;
    this.courseStore = courseStore;
  }

  async login(email: string, password: string): Promise<User> {
    const { data: user } = await authApiClient.post<User>('/auth/token', {
      email,
      password,
    });

    this.appStateStore.setUser(user);

    return user;
  }

  async refresh(refreshToken: string): Promise<User> {
    const existingUser = this.appStateStore.user;
    if (!existingUser) {
      throw new Error('Cannot refresh token: no existing user session');
    }

    const { data: tokenResponse } = await authApiClient.post<
      Pick<User, 'idToken' | 'refreshToken'>
    >('/auth/token', {
      refreshToken,
    });

    const updatedUser: User = {
      userId: existingUser.userId,
      email: existingUser.email,
      idToken: tokenResponse.idToken,
      refreshToken: tokenResponse.refreshToken,
    };
    this.appStateStore.setUser(updatedUser);

    return updatedUser;
  }

  async deleteAccount(password: string): Promise<void> {
    const { email } = this.appStateStore.user || {};
    if (!email) {
      throw new Error('No user logged in');
    }

    const { data: newToken } = await authApiClient.post<Pick<User, 'idToken'>>(
      '/auth/token',
      {
        email,
        password,
      },
    );
    await authApiClient.delete('/auth/account', {
      headers: {
        Authorization: `Bearer ${newToken.idToken}`,
      },
    });
    this.logout();
  }

  logout(): void {
    this.appStateStore.clearUser();
    this.appStateStore.clearRole();
    this.appStateStore.clearIntroSeen();
    this.courseStore.clearCourses();
    router.replace('/LoginScreen');
  }
}

export async function registerNewUser(email: string): Promise<void> {
  await authApiClient.post('/auth/register', { email });
}

export async function resetPassword(email: string): Promise<void> {
  await authApiClient.post('/auth/passwordResetEmail', { email });
}

export default AuthService;
