import { router } from 'expo-router';
import { observer } from 'mobx-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Theme from '../constants/Theme';
import { resetPassword } from '../services/AuthService';
import { showSuccess } from '../utils/alert';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    display: 'flex',
  },
  centeredView: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#222',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    height: 48,
    width: '100%',
    backgroundColor: Theme.PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  switchText: {
    marginTop: 16,
    color: Theme.PRIMARY_COLOR,
    fontWeight: '500',
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
  contextContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Theme.PRIMARY_COLOR,
    width: '100%',
  },
  contextTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  contextText: {
    fontSize: 13,
    color: '#BF360C',
    lineHeight: 20,
  },
});

const ResetPasswordScreen = observer(() => {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const onPasswordReset = async () => {
    if (!email) {
      setErrorMsg(t('reset_password.error.email_required'));
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      await resetPassword(email);
      showSuccess(t('reset_password.toast.success'));
      router.back();
    } catch {
      Toast.show({
        type: 'error',
        text1: t('reset_password.toast.error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centeredView}>
            <Text style={styles.title}>{t('reset_password.title.main')}</Text>

            <View style={styles.contextContainer}>
              <Text style={styles.contextTitle}>
                {t('reset_password.info.title')}
              </Text>
              <Text style={styles.contextText}>
                {t('reset_password.info.text')}
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('reset_password.placeholder.email')}
                placeholderTextColor="#888"
                value={email}
                textContentType="username"
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && { backgroundColor: '#aaa' },
              ]}
              onPress={onPasswordReset}
              disabled={isLoading}
            >
              <Text style={styles.buttonTitle}>
                {t('reset_password.button.reset')}
              </Text>
            </TouchableOpacity>

            {isLoading && (
              <ActivityIndicator
                size="large"
                color={Theme.PRIMARY_COLOR}
                style={{ marginTop: 24 }}
              />
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
});

export default ResetPasswordScreen;
