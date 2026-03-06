import {
  AntDesign,
  Entypo,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Toast from 'react-native-toast-message';
import SyncManager from '../components/SyncManager';
import { initializeI18n } from '../i18n/config';
import Router from '../router/Router';
import RootStore from '../store';
import StoreContext from '../store/context';

const rootStore = new RootStore({
  appStateStorePersistanceKey: 'AppStateStore',
  coursesStorePersistanceKey: 'courses',
});

function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(Platform.OS !== 'web');
  const [i18nInitialized, setI18nInitialized] = useState(false);

  // Initialize i18n
  useEffect(() => {
    const initI18n = async () => {
      try {
        await initializeI18n();
        setI18nInitialized(true);
      } catch (error) {
        console.warn('Failed to initialize i18n:', error);
        setI18nInitialized(true); // Continue even if i18n init fails
      }
    };

    initI18n();
  }, []);

  // Load fonts
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        *:not([class*="icon"]):not([data-font]):not([style*="font-family"]) {
          font-family: 'Roboto-Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
      `;
      document.head.appendChild(style);

      const loadFonts = async () => {
        try {
          await Font.loadAsync({
            ...MaterialIcons.font,
            ...MaterialCommunityIcons.font,
            ...Feather.font,
            ...Entypo.font,
            ...AntDesign.font,
          });
        } finally {
          setFontsLoaded(true);
        }
      };

      loadFonts();

      return () => {
        document.head.removeChild(style);
      };
    }
    return undefined;
  }, []);

  if (!fontsLoaded || !i18nInitialized) {
    return null;
  }

  return (
    <StoreContext.Provider value={rootStore}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={DefaultTheme}>
          <SyncManager />
          <Router />
          <Toast />
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    </StoreContext.Provider>
  );
}

export default RootLayout;
