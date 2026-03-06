import { Alert, Platform } from 'react-native';
import Toast from 'react-native-toast-message';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
): void => {
  if (Platform.OS === 'web' || Platform.OS === 'windows') {
    // If there are buttons with actions, use window.confirm for proper confirmation
    if (buttons && buttons.length > 1) {
      const confirmButton = buttons.find(
        btn => btn.style === 'destructive' || btn.text !== 'Cancel',
      );
      const fullMessage = message ? `${title}\n\n${message}` : title;
      // eslint-disable-next-line no-restricted-globals, no-alert
      const confirmed = window.confirm(fullMessage);
      if (confirmed && confirmButton?.onPress) {
        confirmButton.onPress();
      }
      return;
    }
    // For simple alerts without action buttons, show a toast
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
    return;
  }

  Alert.alert(title, message, buttons);
};

export const showSuccess = (title: string, message?: string): void => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const showError = (title: string, message?: string): void => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
  });
};

export const showInfo = (title: string, message?: string): void => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};
