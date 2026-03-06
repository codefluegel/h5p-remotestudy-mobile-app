import { Feather } from '@expo/vector-icons';
import { observer } from 'mobx-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import uuid from 'react-native-uuid';
import Theme from '../../constants/Theme';
import { useStore } from '../../store/context';
import { Label } from '../../utils/types';

const { width } = Dimensions.get('window');

interface AddGroupModalProps {
  isVisible: boolean;
  courseId: string;
  onClose: () => void;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: width * 0.8,
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
  modalText: {
    fontSize: 24,
    fontFamily: 'Roboto-Medium',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 30,
    fontSize: 16,
    width: width * 0.6,
  },
  saveButton: {
    borderRadius: 4,
    height: 36,
    width: width * 0.6,
    backgroundColor: Theme.PRIMARY_COLOR,
    justifyContent: 'center',
  },
  buttonTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
});

const AddGroupModal = observer(
  ({ isVisible, courseId, onClose }: AddGroupModalProps) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const { courseStore } = useStore();

    const onSave = () => {
      const newLabel: Label = { name: title, color: 'blue', id: uuid.v4() };
      courseStore.addLabelToCourse(courseId, newLabel);
      onClose();
    };

    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
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
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>

                <Text style={styles.modalText}>
                  {t('modal.add_group.title')}
                </Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  placeholder={t('modal.add_group.placeholder')}
                  onChangeText={setTitle}
                  autoFocus
                />
                <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                  <Text style={styles.buttonTitle}>
                    {t('modal.add_group.button_save')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  },
);

export default AddGroupModal;
