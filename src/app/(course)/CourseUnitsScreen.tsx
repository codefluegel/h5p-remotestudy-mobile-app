import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { TabBar, TabBarProps, TabView } from 'react-native-tab-view';

import Entypo from '@expo/vector-icons/Entypo';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import SubmenuOverlay from '../(modals)/SubmenuOverlay';
import CourseStatisticsScreen from '../(statisticsModals)/CourseStatisticsScreen';
import UserListScreen from '../(teacher)/course/CourseUserList';
import UnitsTabs from '../../components/Tabs/UnitsTab';
import Theme from '../../constants/Theme';
import useExportCourse from '../../hooks/useExportCourse';
import { useLocalH5pServer } from '../../localH5pServer/context';
import { useStore } from '../../store/context';
import { showAlert } from '../../utils/alert';

const styles = StyleSheet.create({
  upperContainer: {
    flex: 1,
  },
  blueHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A3782',
    padding: 16,
    marginBottom: 16,
    width: '100%',
  },
  blueTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  blueSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerRightColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  tabBar: {
    backgroundColor: 'white',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: 2,
  },
  indicatorStyle: {
    backgroundColor: Theme.PRIMARY_COLOR,
    height: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.PRIMARY_COLOR,
  },
});

interface TabRoute {
  key: 'first' | 'second' | 'third';
  title: string;
}

const CourseUnitsScreen = observer(() => {
  const { t } = useTranslation();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const { courseId } = useLocalSearchParams();
  const navigation = useNavigation();
  const { courseStore, appStateStore } = useStore();
  const localServer = useLocalH5pServer();

  const isTeacher = appStateStore.isTeacher();
  const course = courseStore.getCourse(String(courseId) ?? '');
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const { handleExport } = useExportCourse(
    String(courseId),
    course?.name ?? 'Course Results',
  );

  const saveCourse = async () => {
    if (course) {
      await courseStore.saveCourse(course);
    }
  };

  const handleDeleteCourse = () => {
    if (!courseId || typeof courseId !== 'string') {
      return;
    }

    showAlert(
      t('course_units.alert.delete_title'),
      t('course_units.alert.delete_msg', {
        course_name: course?.name ?? 'This Course',
      }),
      [
        {
          text: t('course_units.button.cancel'),
          style: 'cancel',
        },
        {
          text: t('course_units.button.delete'),
          style: 'destructive',
          onPress: async () => {
            if (course) {
              if (isTeacher) await courseStore.deleteCourse(course.id);
              await Promise.all(
                course.units.map(unit =>
                  localServer.deleteH5pContent(unit.contentId),
                ),
              );
              navigation.goBack();
            }
            // TODO for student:
            // delete Course
          },
        },
      ],
    );
  };

  const handleClearLocalData = () => {
    if (!course) {
      return;
    }

    showAlert(
      t('course_units.alert.clear_local_title'),
      t('course_units.alert.clear_local_msg', {
        course_name: course.name ?? 'This Course',
      }),
      [
        {
          text: t('course_units.button.cancel'),
          style: 'cancel',
        },
        {
          text: t('course_units.button.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (course.isDownloaded) {
                courseStore.updateCourseById(String(courseId) ?? '', {
                  isDownloaded: false,
                });

                await Promise.all(
                  course.units
                    .filter(unit => typeof unit.contentId === 'number')
                    .map(unit => localServer.deleteH5pContent(unit.contentId)),
                );
              }

              navigation.goBack();
            } catch (error) {
              console.error('Error clearing local data:', error);
            }
          },
        },
      ],
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRightContainerStyle: {
        justifyContent: 'flex-end',
        alignItems: 'center',
      },
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowSettingsModal(true)}
          style={{
            paddingHorizontal: 8,
            paddingVertical: 8,
          }}
        >
          <Entypo name="dots-three-vertical" size={18} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  function SecondRoute() {
    return <CourseStatisticsScreen />;
  }

  const getRoutes = (): TabRoute[] => {
    const baseRoutes: TabRoute[] = [
      { key: 'first', title: t('course_units.tab.units') },
    ];

    if (isTeacher) {
      baseRoutes.push({ key: 'second', title: t('course_units.tab.results') });
      baseRoutes.push({ key: 'third', title: t('course_units.tab.students') });
    }

    return baseRoutes;
  };

  const [routes] = useState<TabRoute[]>(getRoutes());

  const renderScene = ({ route }: { route: TabRoute }) => {
    switch (route.key) {
      case 'first':
        return <UnitsTabs />;
      case 'second':
        return <SecondRoute />;
      case 'third':
        return <UserListScreen />;
      default:
        return null;
    }
  };

  const handleSubmenuAction = (actionKey: string) => {
    switch (actionKey) {
      case 'export_results':
        handleExport();
        break;
      case 'sync_courses':
        {
          saveCourse();
          const role = appStateStore.isTeacher() ? 'Teacher' : 'Student';
          courseStore.fetchCourses(role);
        }
        break;
      case 'save_course':
        saveCourse();
        break;
      case 'delete_course':
        handleDeleteCourse();
        break;
      case 'clear_local_data':
        handleClearLocalData();
        break;

      default:
        console.warn('Unknown submenu action:', actionKey);
    }
  };

  const renderTabBar = (props: TabBarProps<TabRoute>) => (
    <TabBar
      {...props}
      style={styles.tabBar}
      indicatorStyle={styles.indicatorStyle}
      activeColor={Theme.PRIMARY_COLOR}
      inactiveColor="#AAAAAA"
    />
  );

  return (
    <SafeAreaView style={styles.upperContainer}>
      <TabView<TabRoute>
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        lazy
        lazyPreloadDistance={0}
      />
      {showSettingsModal && (
        <SubmenuOverlay
          visible={showSettingsModal}
          isTeacher={isTeacher}
          onClose={() => setShowSettingsModal(false)}
          onAction={actionKey => {
            handleSubmenuAction(actionKey);
          }}
        />
      )}
    </SafeAreaView>
  );
});

export default CourseUnitsScreen;
