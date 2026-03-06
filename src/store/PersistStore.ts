import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  makePersistable,
  stopPersisting,
  type StorageController,
} from 'mobx-persist-store';
import { Platform } from 'react-native';

const baseUrlPrefix =
  process.env.EXPO_PUBLIC_PERSISTENCE_KEY_VALUE_API_BASE_URL;

const RestStorageApiWrapper: StorageController = {
  setItem: async (key: string, value: unknown) => {
    await axios.put(`${baseUrlPrefix}/${encodeURIComponent(key)}`, value, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  getItem: async (key: string) => {
    const response = await axios.get(
      `${baseUrlPrefix}/${encodeURIComponent(key)}`,
    );
    return response.data;
  },
  removeItem: async (key: string) => {
    await axios.delete(`${baseUrlPrefix}/${encodeURIComponent(key)}`);
  },
};

const storage = baseUrlPrefix ? RestStorageApiWrapper : AsyncStorage;

type MakePersistableParameters = Parameters<typeof makePersistable>;

const persistStore = <
  T extends MakePersistableParameters[0],
  P extends keyof T,
>(
  target: T,
  properties: P[],
  persistName: string,
): void => {
  stopPersisting(target);
  makePersistable(
    target,
    {
      name: persistName,
      properties,
      // prevent bundling error on web platform
      storage:
        Platform.OS === 'web' && typeof window === 'undefined'
          ? undefined
          : storage,
    },
    { delay: 200, fireImmediately: false },
  );
};

export default persistStore;
