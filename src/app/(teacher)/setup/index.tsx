import { router } from 'expo-router';
import { observer } from 'mobx-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import uuid from 'react-native-uuid';
import FileUploadModal from '../../../components/FileUploadModal';
import ProgressModal from '../../../components/Modal/ProgressModal';
import Theme from '../../../constants/Theme';
import { useLocalH5pServer } from '../../../localH5pServer/context';
import { saveCourse } from '../../../services/service';
import { useStore } from '../../../store/context';
import { showAlert, showError } from '../../../utils/alert';
import { Course, CourseStatus, Unit } from '../../../utils/types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.BACKGROUND_COLOR,
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  card: {
    backgroundColor: Theme.SURFACE_COLOR,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Theme.PRIMARY_TEXT_COLOR,
    marginBottom: 10,
  },
  explanationText: {
    fontSize: 15,
    color: Theme.SECONDARY_TEXT_COLOR,
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    backgroundColor: Theme.BACKGROUND_COLOR,
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    color: Theme.PRIMARY_TEXT_COLOR,
  },
  button: {
    width: '100%',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: Theme.PRIMARY_COLOR,
    shadowColor: Theme.PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: Theme.ON_PRIMARY_COLOR,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const NewCourseScreen = observer(() => {
  const { t } = useTranslation();
  const [courseName, setCourseName] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const localServer = useLocalH5pServer();
  const { courseStore, appStateStore } = useStore();

  const isTeacher = appStateStore.role === 'Teacher';

  const downloadCourse = async () => {
    if (isTeacher) {
      if (!courseName || courseName.trim() === '') {
        showAlert(
          t('setup.alert.name_missing_title'),
          t('setup.alert.name_missing_msg'),
        );
        return;
      }
      if (!downloadLink || downloadLink.trim() === '') {
        showAlert(
          t('setup.alert.link_needed_title'),
          t('setup.alert.link_needed_msg'),
        );
        return;
      }
      const urlPattern = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
      if (!urlPattern.test(downloadLink)) {
        showAlert(
          t('setup.alert.invalid_link_title'),
          t('setup.alert.invalid_link_msg'),
        );
        return;
      }
      setShowModal(true);
      try {
        const addedCourses = await localServer.addH5pBundle(downloadLink);
        const newCourse: Course = {
          id: uuid.v4(),
          name: courseName,
          units: [],
          labels: [],
          downloadLink,
          status: CourseStatus.New,
        };
        await Promise.all(
          addedCourses.map(async ({ id, hash }) => {
            const h5pData = await localServer.getH5pMetadata(id);
            const h5pUnit: Unit = {
              contentId: id,
              contentHash: hash,
              name: h5pData.title,
              sortingIndex: 0,
            };
            newCourse.units?.push(h5pUnit);
          }),
        );
        courseStore.addCourse(newCourse);
        await saveCourse(newCourse.id, newCourse);
        setShowModal(false);
        router.replace('/course');
      } catch {
        showError(
          t('setup.alert.download_failed_title'),
          t('setup.alert.download_failed_msg'),
        );
      } finally {
        setShowModal(false);
        setDownloadLink('');
        setCourseName('');
      }
    } else {
      router.replace('/course');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {isTeacher ? (
          <>
            <Text style={styles.sectionTitle}>
              {t('setup.title.create_course')}
            </Text>
            <Text style={styles.explanationText}>
              {t('setup.info.instructions')}
            </Text>
            <TextInput
              style={styles.input}
              value={courseName}
              onChangeText={setCourseName}
              placeholder={t('setup.placeholder.course_name')}
              placeholderTextColor={Theme.SECONDARY_TEXT_COLOR}
            />
            <TextInput
              style={styles.input}
              value={downloadLink}
              onChangeText={setDownloadLink}
              placeholder={t('setup.placeholder.download_link')}
              placeholderTextColor={Theme.SECONDARY_TEXT_COLOR}
            />
            <TouchableOpacity
              style={{ marginTop: 8 }}
              onPress={() => setShowUploadModal(true)}
            >
              <Text style={{ color: Theme.PRIMARY_COLOR, fontWeight: '600' }}>
                {t('setup.link.upload_file')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={downloadCourse}>
              <Text style={styles.buttonText}>
                {t('setup.button.download_course')}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {t('setup.title.explore_courses')}
            </Text>
            <Text style={styles.explanationText}>
              {t('setup.info.student_ready')}
            </Text>
            <TouchableOpacity style={styles.button} onPress={downloadCourse}>
              <Text style={styles.buttonText}>
                {t('setup.button.view_courses')}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <ProgressModal
        text={t('setup.progress.downloading')}
        isVisible={showModal}
      />
      <FileUploadModal
        isVisible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={link => {
          setDownloadLink(link);
        }}
      />
    </ScrollView>
  );
});

export default NewCourseScreen;
