import { observer } from 'mobx-react';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Theme from '../../constants/Theme';

interface EditItemModalProps {
  isVisible: boolean;
  text: string;
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height / 2,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.PRIMARY_COLOR,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

const ProgressModal = observer(({ isVisible, text }: EditItemModalProps) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={() => {}}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>{text}</Text>
          <ActivityIndicator
            size="large"
            color={Theme.PRIMARY_COLOR}
            style={styles.loadingIndicator}
          />
        </View>
      </View>
    </Modal>
  );
});

export default ProgressModal;
