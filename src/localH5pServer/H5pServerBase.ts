import axios from 'axios';

const { EXPO_PUBLIC_DEBUG_SERVER_URL } = process.env;

export interface ContentMetadata {
  // relevant parts of IContentMetadata of @lumieducation/h5p-server
  // package

  language: string;
  license: string;
  mainLibrary: string;
  title: string;
  authors: {
    name: string;
    role: string;
  }[];
  licenseVersion: string;
  yearFrom: number;
  licenseExtras: string;
}

export default class LocalH5pServerBase {
  private serverUrl = EXPO_PUBLIC_DEBUG_SERVER_URL;

  protected async getUrl() {
    return this.serverUrl;
  }

  private async getAxiosInstance() {
    const baseUrl = await this.getUrl();
    return axios.create({
      baseURL: baseUrl,
    });
  }

  async addH5pFile(remoteUrl: string) {
    const response = await (
      await this.getAxiosInstance()
    ).post<{ id: number; hash: string }[]>('/api/v1/h5p', {
      url: remoteUrl,
    });
    return response.data[0];
  }

  async addH5pBundle(remoteUrl: string) {
    const response = await (
      await this.getAxiosInstance()
    ).post<{ id: number; hash: string }[]>('/api/v1/h5p', {
      url: remoteUrl,
    });
    return response.data;
  }

  async deleteH5pContent(contentId: number): Promise<void> {
    const response = await (
      await this.getAxiosInstance()
    ).delete(`/api/v1/h5p/${contentId}`);
    return response.data.id;
  }

  async getH5pMetadata(contentId: number): Promise<ContentMetadata> {
    const response = await (
      await this.getAxiosInstance()
    ).get(`/api/v1/h5p/${contentId}/metadata`);
    return response.data;
  }

  async getH5pViewUrl(contentId: number): Promise<string> {
    return `${(await this.getUrl()) ?? ''}/api/v1/h5p/${contentId}/play`;
  }
}
