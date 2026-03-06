import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { fetch } from 'expo/fetch';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Theme from '../constants/Theme';
import { createFileUrl } from '../services/service';
import { showError } from '../utils/alert';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: (downloadUrl: string) => void;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.PRIMARY_TEXT_COLOR,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    backgroundColor: Theme.BACKGROUND_COLOR,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
    color: Theme.PRIMARY_TEXT_COLOR,
  },
  hint: {
    fontSize: 14,
    color: Theme.SECONDARY_TEXT_COLOR,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Theme.PRIMARY_COLOR,
    borderRadius: 8,
  },
  smallButtonText: { color: Theme.ON_PRIMARY_COLOR, fontWeight: '600' },
});

const FileUploadModal = observer(({ isVisible, onClose, onSuccess }: Props) => {
  const { t } = useTranslation();
  const [filename, setFilename] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [file, setFile] = useState<File>();
  const [isUploading, setIsUploading] = useState(false);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: 'application/zip',
      });
      const outputFileWeb = res.output?.item(0);
      if (outputFileWeb) {
        setFile(outputFileWeb);
        if (outputFileWeb.name) {
          setFilename(outputFileWeb.name);
        }
      } else {
        const r = res.assets?.[0];
        if (r && r.uri) {
          setFileUri(r.uri);
        }
        if (r?.name) setFilename(r.name);
      }
    } catch {
      showError(
        t('modal.file_upload.alert.pick_title'),
        t('modal.file_upload.alert.pick_msg'),
      );
    }
  };

  const doUpload = async () => {
    if (!filename || filename.trim() === '') {
      showError(
        t('modal.file_upload.alert.filename_title'),
        t('modal.file_upload.alert.filename_msg'),
      );
      return;
    }
    if (!fileUri?.trim() && !file) {
      showError(
        t('modal.file_upload.alert.uri_title'),
        t('modal.file_upload.alert.uri_msg'),
      );
      return;
    }

    setIsUploading(true);
    try {
      const res = await createFileUrl(filename);
      const { uploadUrl } = res.data;
      const { downloadUrl } = res.data;

      const uploadBody = file ?? new FileSystem.File(fileUri);

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/zip',
        },
        body: uploadBody,
      });

      if (uploadRes.status < 200 || uploadRes.status >= 300) {
        throw new Error(`Upload failed with status ${uploadRes.status}`);
      }

      try {
        const headRes = await fetch(downloadUrl, { method: 'HEAD' });
        if (!headRes.ok) {
          throw new Error(`HEAD verification failed: ${headRes.status}`);
        }
      } catch {
        throw new Error('Upload verification failed');
      }

      setIsUploading(false);
      setFilename('');
      setFileUri('');
      onSuccess(downloadUrl);
      onClose();
    } catch {
      setIsUploading(false);
      showError(
        t('modal.file_upload.alert.failed_title'),
        t('modal.file_upload.alert.failed_msg'),
      );
    }
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
        <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>{t('modal.file_upload.title')}</Text>
            <Text style={styles.hint}>{t('modal.file_upload.info')}</Text>

            <TextInput
              style={styles.input}
              placeholder={t('modal.file_upload.placeholder_filename')}
              placeholderTextColor={Theme.SECONDARY_TEXT_COLOR}
              value={filename}
              editable={false}
              onChangeText={setFilename}
            />

            <TextInput
              style={styles.input}
              placeholder={t('modal.file_upload.placeholder_uri')}
              placeholderTextColor={Theme.SECONDARY_TEXT_COLOR}
              value={fileUri}
              editable={false}
              onChangeText={setFileUri}
            />

            <TouchableOpacity
              style={[
                styles.smallButton,
                { marginTop: 6, alignSelf: 'flex-start' },
              ]}
              onPress={pickFile}
            >
              <Text style={styles.smallButtonText}>
                {t('modal.file_upload.button.pick')}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 8 }} />

            <View style={styles.row}>
              <TouchableOpacity style={{ marginRight: 8 }} onPress={onClose}>
                <View style={{ padding: 12 }}>
                  <Text style={{ color: Theme.PRIMARY_COLOR }}>
                    {t('modal.file_upload.button.cancel')}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={doUpload}
                disabled={isUploading}
              >
                <Text style={styles.smallButtonText}>
                  {isUploading
                    ? t('modal.file_upload.button.uploading')
                    : t('modal.file_upload.button.upload')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

export default FileUploadModal;
