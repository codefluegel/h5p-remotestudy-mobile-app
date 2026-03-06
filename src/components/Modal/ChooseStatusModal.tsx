import { Feather } from '@expo/vector-icons';
import { observer } from 'mobx-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStore } from '../../store/context';
import { CourseStatus } from '../../utils/types';

const { width } = Dimensions.get('window');

const BRAND_PRIMARY = '#4A90E2';
const BRAND_SECONDARY = '#A7D9FC';
const BACKGROUND_LIGHT = '#F8F8F8';
const TEXT_PRIMARY = '#2C3E50';
const TEXT_SECONDARY = '#7F8C8D';
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.15)';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentContainer: {
    backgroundColor: BACKGROUND_LIGHT,
    borderRadius: 16,
    paddingVertical: 35,
    paddingHorizontal: 30,
    width: width * 0.88,
    alignItems: 'center',
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8,
    zIndex: 1,
  },
  closeIcon: {
    color: TEXT_SECONDARY,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 35,
    textAlign: 'center',
  },
  statusButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  inactiveButton: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: BRAND_SECONDARY,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inactiveButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
  },
  activeButton: {
    backgroundColor: BRAND_PRIMARY,
    shadowColor: BRAND_PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  activeButtonText: {
    color: BRAND_SECONDARY,
    fontSize: 18,
    fontWeight: '700',
  },
});

const ChooseStatusModal = observer(
  ({
    isVisible,
    courseId,
    onClose,
  }: {
    isVisible: boolean;
    courseId: string;
    onClose: () => void;
  }) => {
    const { t } = useTranslation();
    const { courseStore } = useStore();
    const course = courseStore.getCourse(courseId);
    const currentStatus = course?.status;

    const onStatusChosen = (status: CourseStatus) => {
      if (course) {
        courseStore.updateCourseById(course.id, { status });
        courseStore.saveCourse(course);
      }
      onClose();
    };

    const renderStatusButton = (
      statusKey: CourseStatus,
      statusName: string,
    ) => {
      const isActive = currentStatus === statusKey;

      return (
        <TouchableOpacity
          style={[
            styles.statusButton,
            isActive ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => onStatusChosen(statusKey)}
          key={statusKey}
        >
          <Text
            style={[
              styles.inactiveButtonText,
              isActive && styles.activeButtonText,
            ]}
          >
            {statusName}
          </Text>
        </TouchableOpacity>
      );
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
            <View style={styles.modalContentContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Feather name="x" size={26} style={styles.closeIcon} />
              </TouchableOpacity>

              <Text style={styles.title}>{t('modal.status.title')}</Text>

              {renderStatusButton(
                CourseStatus.New,
                t('modal.status.button.new'),
              )}
              {renderStatusButton(
                CourseStatus.Running,
                t('modal.status.button.progress'),
              )}
              {renderStatusButton(
                CourseStatus.Closed,
                t('modal.status.button.completed'),
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  },
);

export default ChooseStatusModal;
