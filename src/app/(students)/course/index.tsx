import { Feather } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import DimensionsFlatList from '../../../components/Cards/DimensionsList';
import Theme from '../../../constants/Theme';
import { useStore } from '../../../store/context';
import { Course } from '../../../utils/types';

const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 50, // tab bar height
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
  },
});

const StudentsCoursesScreen = observer(() => {
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

  const handleCourseEditPress = (course: Course) => {
    router.push({
      pathname: '/(students)/course/CourseUnitsScreen',
      params: {
        courseId: course.id,
      },
    });
  };

  const resetUserRole = useCallback(() => {
    appStateStore.clearIntroSeen();
    appStateStore.clearRole();
    appStateStore.clearUser();
    courseStore.clearCourses();
    router.replace('/ChooseRoleScreen');
  }, [appStateStore, courseStore]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={resetUserRole}>
          <Feather
            style={{ marginLeft: 8 }}
            name="log-out"
            size={24}
            color="black"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, resetUserRole]);

  return (
    <SafeAreaView style={styles.wrapperView}>
      {courseStore.isLoading && (
        <ActivityIndicator
          size="large"
          color={Theme.PRIMARY_COLOR}
          style={{ paddingBottom: 20 }}
        />
      )}
      {!courseStore.isLoading && courses.length === 0 && (
        <Text style={styles.emptyText}>
          No courses available. Please contact your teacher.
        </Text>
      )}
      {!courseStore.isLoading && courses.length > 0 && (
        <DimensionsFlatList
          data={courses}
          onPress={(course: Course) => handleCourseEditPress(course)}
        />
      )}
    </SafeAreaView>
  );
});

export default StudentsCoursesScreen;
