import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Theme from '../../constants/Theme';
import { Label, Unit } from '../../utils/types';

interface EditUnitModalProps {
  isVisible: boolean;
  unit: Unit | null;
  onSave: (text: string, label: Label | null) => void;
  onDelete?: () => void;
  onClose: () => void;
  labels: Label[];
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingBottom: 40,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollContent: {
    flexGrow: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    left: 15,
    zIndex: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 2,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Theme.PRIMARY_COLOR,
    borderRadius: 5,
    paddingVertical: 12,
    marginTop: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    marginTop: 20,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

const EditUnitModal = observer(
  ({
    isVisible,
    unit,
    onSave,
    onDelete,
    onClose,
    labels,
  }: EditUnitModalProps) => {
    const { t } = useTranslation();
    const [inputText, setInputText] = useState('');
    const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);

    useEffect(() => {
      if (unit) {
        setInputText(unit.name ?? '');
        setSelectedLabelId(unit.label ? unit.label.id : null);
      }
    }, [unit]);

    const handleSave = () => {
      const selectedLabel =
        labels.find(label => label.id === selectedLabelId) || null;
      onSave(inputText, selectedLabel);
      onClose();
    };

    return (
      <Modal
        animationType="slide"
        transparent
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Feather name="trash" size={24} color="gray" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="gray" />
            </TouchableOpacity>

            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.label, { paddingTop: 12 }]}>
                {t('modal.edit_unit.label_title')}
              </Text>

              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
              />

              {labels.length > 0 && (
                <View style={styles.pickerContainer}>
                  <Text style={styles.label}>
                    {t('modal.edit_unit.label_group')}
                  </Text>
                  <Picker
                    selectedValue={selectedLabelId}
                    style={styles.picker}
                    onValueChange={itemValue => {
                      setSelectedLabelId(itemValue);
                    }}
                  >
                    <Picker.Item
                      label={t('modal.edit_unit.picker_none')}
                      value={null}
                    />
                    {labels.map(label => (
                      <Picker.Item
                        key={label.id}
                        label={label.name}
                        value={label.id}
                      />
                    ))}
                  </Picker>
                </View>
              )}

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {t('modal.edit_unit.button_save')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  },
);

export default EditUnitModal;
