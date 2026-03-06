import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

import de from './locales/de.json';
import en from './locales/en.json';

const resources = {
  en: { translation: en },
  de: { translation: de },
};

const getDeviceLanguage = (): string => {
  if (Platform.OS === 'windows') {
    return 'en';
  }
  return 'en';
};

const initializeI18n = async () => {
  let savedLanguage = 'en';

  if (Platform.OS === 'windows') {
    savedLanguage = 'en';
  } else {
    try {
      const stored = await AsyncStorage.getItem('appLanguage');
      savedLanguage = stored || getDeviceLanguage();
    } catch (error) {
      console.warn('Failed to retrieve stored language preference:', error);
      savedLanguage = getDeviceLanguage();
    }
  }

  i18next.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    defaultNS: 'translation',
    ns: ['translation'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};

export { getDeviceLanguage, initializeI18n };
export default i18next;
