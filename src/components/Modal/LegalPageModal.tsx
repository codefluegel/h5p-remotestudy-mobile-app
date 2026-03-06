import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import Theme from '../../constants/Theme';

interface LegalPageModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  url: string;
}
const { width, height } = Dimensions.get('window');

const MODAL_WIDTH = width > 700 ? 500 : width * 0.9;
const MODAL_HEIGHT = height * 0.8;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: Theme.PRIMARY_TEXT_COLOR,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.PRIMARY_COLOR,
  },
  webView: {
    flex: 1,
    borderRadius: 8,
  },
  iframe: {
    flex: 1,
    borderRadius: 8,
  },
});

function LegalPageModal({
  isVisible,
  onClose,
  title,
  url,
}: LegalPageModalProps) {
  const { t } = useTranslation();
  const isWeb = Platform.OS === 'web';

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.modalCloseText}>
              {t('modal.legal.button_close')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          {isWeb ? (
            <iframe src={url} style={styles.iframe} title={title} />
          ) : (
            <WebView
              style={styles.webView}
              source={{ uri: url }}
              startInLoadingState
              scalesPageToFit
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

export default LegalPageModal;
