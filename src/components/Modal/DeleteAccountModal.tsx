import { router } from 'expo-router';
import { observer } from 'mobx-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Theme from '../../constants/Theme';
import { useStore } from '../../store/context';
import { showAlert } from '../../utils/alert';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.85,
  },
  modalView: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2B5B',
    marginBottom: 15,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: Theme.SECONDARY_TEXT_COLOR,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.PRIMARY_TEXT_COLOR,
    marginBottom: 8,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: Theme.PRIMARY_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Theme.PRIMARY_TEXT_COLOR,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  cancelButton: {
    backgroundColor: Theme.SURFACE_COLOR,
    borderWidth: 1,
    borderColor: Theme.PRIMARY_COLOR,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Theme.PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButtonDisabled: {
    backgroundColor: '#D3D3D3',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

const DeleteAccountModal = observer(
  ({
    isVisible,
    onClose,
  }: {
    isVisible: boolean;
    onClose: () => void;
  }): React.ReactElement => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { authService } = useStore();

    const handleDeleteAccount = async (): Promise<void> => {
      if (!password.trim()) {
        showAlert(
          t('modal.delete_account.alert.error'),
          t('modal.delete_account.alert.password_required'),
        );
        return;
      }

      setIsLoading(true);
      try {
        await authService.deleteAccount(password);
        router.replace('/');
      } catch (error) {
        setIsLoading(false);
        const errorMessage =
          error instanceof Error
            ? error.message
            : t('modal.delete_account.alert.failed');
        showAlert(t('modal.delete_account.alert.error'), errorMessage);
        setPassword('');
      }
    };

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.title}>
                  {t('modal.delete_account.title')}
                </Text>

                <Text style={styles.warningText}>
                  {t('modal.delete_account.warning')}
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    {t('modal.delete_account.label_password')}
                  </Text>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('modal.delete_account.placeholder_password')}
                    placeholderTextColor={Theme.SECONDARY_TEXT_COLOR}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>
                      {t('modal.delete_account.button.cancel')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      isLoading && styles.deleteButtonDisabled,
                    ]}
                    onPress={handleDeleteAccount}
                    disabled={isLoading || !password.trim()}
                  >
                    {isLoading ? (
                      <View style={styles.loaderContainer}>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={styles.deleteButtonText}>
                          {t('modal.delete_account.button.deleting')}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.deleteButtonText}>
                        {t('modal.delete_account.button.delete')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  },
);

export default DeleteAccountModal;
