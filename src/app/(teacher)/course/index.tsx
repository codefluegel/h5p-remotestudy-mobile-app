import { Entypo } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { observer } from 'mobx-react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import DimensionsFlatList from '../../../components/Cards/DimensionsList';
import ChooseStatusModal from '../../../components/Modal/ChooseStatusModal';
import Theme from '../../../constants/Theme';
import { useStore } from '../../../store/context';
import { Course } from '../../../utils/types';

const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    marginBottom: 50, // tab bar height
  },
});

const TeacherCoursesScreen = observer(() => {
  const [statusModalOpened, setStatusModalOpened] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const { courseStore, appStateStore } = useStore();
  const courses = Array.from(courseStore.courses.values());
  const navigation = useNavigation();
  const { role } = appStateStore;
  const isAuthenticated = !!appStateStore.user?.idToken;

  useEffect(() => {
    if (!role || !isAuthenticated) {
      return;
    }
    courseStore.fetchCourses(role);
  }, [courseStore, role, isAuthenticated]);

  const handleCoursePress = (course: Course) => {
    router.push({
      pathname: '/(teacher)/course/CourseUnitsScreen',
      params: {
        courseId: course.id,
      },
    });
  };

  const handleCourseStatusPress = (course: Course) => {
    setSelectedCourseId(course.id);
    setStatusModalOpened(true);
  };

  const resetUserRole = useCallback(async () => {
    try {
      appStateStore.clearIntroSeen();
      appStateStore.clearRole();
      appStateStore.clearUser();
      courseStore.clearCourses();
      router.replace('/ChooseRoleScreen');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [appStateStore, courseStore]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            paddingHorizontal: 8,
            paddingVertical: 8,
          }}
          onPress={resetUserRole}
        >
          <Entypo name="log-out" size={18} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, resetUserRole]);

  return (
    <SafeAreaView style={styles.wrapperView}>
      {courseStore.isLoading ? (
        <ActivityIndicator
          size="large"
          color={Theme.PRIMARY_COLOR}
          style={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <DimensionsFlatList
            data={courses}
            onPressStatus={(course: Course) => handleCourseStatusPress(course)}
            onPress={(course: Course) => handleCoursePress(course)}
          />

          <ChooseStatusModal
            isVisible={statusModalOpened}
            courseId={selectedCourseId}
            onClose={() => setStatusModalOpened(false)}
          />
        </View>
      )}
    </SafeAreaView>
  );
});

export default TeacherCoursesScreen;
