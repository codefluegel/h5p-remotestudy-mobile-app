import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import useTogglePasswordVisibility from '../hooks/useTogglePasswordVisibility';
import { registerNewUser } from '../services/AuthService';
import { useStore } from '../store/context';
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#222',
  },
  successContainer: {
    backgroundColor: '#D4EDDA',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
    width: '100%',
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 8,
  },
  successSubText: {
    fontSize: 14,
    color: '#155724',
    marginBottom: 4,
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
    ...(Platform.OS === 'web' && {
      zIndex: 1,
    }),
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
    backgroundColor: '#E3F2FD',
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
    color: Theme.PRIMARY_COLOR,
    marginBottom: 8,
  },
  contextText: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
  },
});

const LoginScreen = observer(() => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { t } = useTranslation();

  const { passwordVisibility, rightIcon, togglePasswordVisibility } =
    useTogglePasswordVisibility();
  const { appStateStore, authService } = useStore();

  const continueToApp = () => {
    if (appStateStore.isTeacher()) {
      router.navigate('/(teacher)/course');
    } else {
      router.navigate('/(students)/course');
    }
  };

  const onLogin = async () => {
    if (!email) {
      setErrorMsg(t('login.error.email_required'));
      return;
    }
    if (!isSignup && !password) {
      setErrorMsg(t('login.error.password_required'));
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isSignup) {
        await registerNewUser(email);
        setRegistrationSuccess(true);
        showSuccess(t('login.toast.registration_sent'));
        setTimeout(() => {
          setRegistrationSuccess(false);
          setIsSignup(false);
          setEmail('');
          setPassword('');
        }, 3000);
      } else {
        await authService.login(email, password);
        continueToApp();
      }
    } catch (error) {
      console.log(JSON.stringify(error));

      if (isSignup) {
        Toast.show({
          type: 'error',
          text1: t('login.toast.error_register'),
          visibilityTime: 5000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: t('login.toast.error_login'),
          visibilityTime: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSignup = () => {
    setEmail('');
    setPassword('');
    setErrorMsg('');
    setRegistrationSuccess(false);
    setIsSignup(!isSignup);
  };

  const goToResetPassword = () => {
    const resetPasswordRoute = '/ResetPasswordScreen' as Href;
    router.navigate(resetPasswordRoute);
  };

  const goToIntro = () => {
    appStateStore.clearIntroSeen();
    appStateStore.clearRole();
    appStateStore.clearUser();
    router.replace('/ChooseRoleScreen');
  };

  const MainContent = (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      disabled={Platform.OS === 'web'}
    >
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.centeredView}>
          <Text style={styles.title}>
            {isSignup ? t('login.title.register') : t('login.title.login')}
          </Text>

          {registrationSuccess && (
            <View style={{ ...styles.successContainer, marginBottom: 20 }}>
              <Text style={styles.successText}>
                {t('login.success.registered')}
              </Text>
              <Text style={styles.successSubText}>
                {t('login.success.check_email')}
              </Text>
              <Text style={styles.successSubText}>
                {t('login.success.redirecting')}
              </Text>
            </View>
          )}

          {!registrationSuccess && (
            <>
              {isSignup && (
                <View style={styles.contextContainer}>
                  <Text style={styles.contextTitle}>
                    {t('login.info.signup_title')}
                  </Text>
                  <Text style={styles.contextText}>
                    {t('login.info.signup_text')}
                  </Text>
                </View>
              )}

              {!isSignup && !errorMsg && (
                <View style={styles.contextContainer}>
                  <Text style={styles.contextTitle}>
                    {t('login.info.login_title')}
                  </Text>
                  <Text style={styles.contextText}>
                    {t('login.info.login_text')}
                  </Text>
                </View>
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={t('login.placeholder.email')}
                  placeholderTextColor="#888"
                  value={email}
                  textContentType="username"
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  editable={!isLoading}
                />
              </View>

              {!isSignup && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('login.placeholder.password')}
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={passwordVisibility}
                    editable={!isLoading}
                  />
                  <Pressable onPress={togglePasswordVisibility}>
                    <MaterialCommunityIcons
                      name={rightIcon}
                      size={24}
                      color="#666"
                    />
                  </Pressable>
                </View>
              )}

              {errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && { backgroundColor: '#aaa' },
                ]}
                onPress={onLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.buttonTitle}>
                    {isSignup
                      ? t('login.button.register')
                      : t('login.button.login')}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleSignup} disabled={isLoading}>
                <Text style={styles.switchText}>
                  {isSignup
                    ? t('login.link.switch_to_login')
                    : t('login.link.switch_to_register')}
                </Text>
              </TouchableOpacity>

              {!isSignup && (
                <TouchableOpacity
                  onPress={goToResetPassword}
                  disabled={isLoading}
                >
                  <Text style={styles.switchText}>
                    {t('login.link.forgot_password')}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={goToIntro} disabled={isLoading}>
                <Text style={styles.switchText}>
                  {t('login.link.back_to_intro')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );

  return Platform.OS === 'ios' || Platform.OS === 'android' ? (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {MainContent}
    </KeyboardAvoidingView>
  ) : (
    <View style={styles.container}>{MainContent}</View>
  );
});

export default LoginScreen;
