import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type AuthStore from '../store/AuthStore';
import type AuthService from './AuthService';

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

class ApiClient {
  private client: AxiosInstance;

  private authStore: AuthStore | null = null;

  private authService: AuthService | null = null;

  private isRefreshing = false;

  private failedQueue: QueuedRequest[] = [];

  constructor() {
    this.client = axios.create({
      // temporary url until expo build works again
      baseURL:
        process.env.EXPO_PUBLIC_API_BASE_URL ||
        'https://europe-west1-h5p-remote-study-dev.cloudfunctions.net/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  configureAuth(authStore: AuthStore, authService: AuthService): void {
    this.authStore = authStore;
    this.authService = authService;
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.authStore?.accessToken;
        if (token && config.headers) {
          const updatedConfig = { ...config };
          updatedConfig.headers.Authorization = `Bearer ${token}`;
          return updatedConfig;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest.retry) {
          originalRequest.retry = true;

          if (!this.authStore?.refreshToken || !this.authService) {
            return Promise.reject(error);
          }

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(token => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          this.isRefreshing = true;

          try {
            const user = await this.authService.refresh(
              this.authStore.refreshToken,
            );

            this.failedQueue.forEach(p => p.resolve(user.idToken));
            this.failedQueue = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${user.idToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.failedQueue.forEach(p => p.reject(refreshError));
            this.failedQueue = [];

            this.authService.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  getInstance(): AxiosInstance {
    return this.client;
  }
}

const apiClientInstance = new ApiClient();

export function configureClientAuth(
  authStore: AuthStore,
  authService: AuthService,
): void {
  apiClientInstance.configureAuth(authStore, authService);
}

export default apiClientInstance.getInstance();
