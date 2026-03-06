import { observer } from 'mobx-react';
import React from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
    borderRadius: 8,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    padding: 5,
  },
  closeText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F2B5B',
    marginBottom: 30,
    textAlign: 'center',
  },
  setupButton: {
    borderWidth: 1,
    borderColor: '#436CAA',
    borderRadius: 4,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  setupButtonText: {
    color: '#436CAA',
    fontSize: 14,
    fontWeight: '600',
  },
  goToCourseButton: {
    backgroundColor: '#2C5697',
    borderRadius: 4,
    padding: 12,
    width: '100%',
    alignItems: 'center',
  },
  goToCourseText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

const TwoButtonModal = observer(
  ({
    isVisible,
    title,
    topButtonTitle,
    bottomButtonTitle,
    onTopButtonTapped,
    onBottomButtonTapped,
    onClose,
  }: {
    isVisible: boolean;
    title: string;
    topButtonTitle: string;
    bottomButtonTitle?: string;
    onTopButtonTapped: () => void;
    onBottomButtonTapped: () => void;
    onClose: () => void;
  }) => {
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
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                <Text style={styles.title}>{title}</Text>

                <TouchableOpacity
                  style={styles.setupButton}
                  onPress={onTopButtonTapped}
                >
                  <Text style={styles.setupButtonText}>{topButtonTitle}</Text>
                </TouchableOpacity>

                {bottomButtonTitle && (
                  <TouchableOpacity
                    style={styles.goToCourseButton}
                    onPress={onBottomButtonTapped}
                  >
                    <Text style={styles.goToCourseText}>
                      {bottomButtonTitle}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  },
);

export default TwoButtonModal;
