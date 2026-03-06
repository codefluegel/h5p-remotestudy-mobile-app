import { useFocusEffect } from 'expo-router';
import { observer } from 'mobx-react';
import React, { useCallback, useState } from 'react';
// eslint-disable-next-line id-denylist
import { FlatList, SafeAreaView, StyleSheet, Text } from 'react-native';
import { CourseResultsItem } from '../../../components/Results/CourseResultsItem';
import { useCourseResults } from '../../../hooks/useCourseResults';
import { useStore } from '../../../store/context';

const componentStyles = StyleSheet.create({
  wrapperView: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
});

export type ScoreDetails = {
  raw: number;
  max: number;
};

export type SectionScoreBreakdown = {
  [sectionName: string]: ScoreDetails;
};

export type UnitResultData =
  | SectionScoreBreakdown[]
  | { score: number; maxScore: number }
  | null;

export type UnitResult = {
  courseId: string;
  unitId: string;
  result: UnitResultData;
  unitName?: string;
  courseName?: string;
  userId?: string;
};

const StudentsResultsScreen = observer(() => {
  const { courseStore, appStateStore } = useStore();
  const { courses } = courseStore;
  const userId = appStateStore.user?.userId;
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const { unitResults, isLoading, refetch } = useCourseResults(userId, courses);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourseId(prevId => (prevId === courseId ? null : courseId));
  };

  const hasResults = unitResults && Object.keys(unitResults).length > 0;

  return (
    <SafeAreaView style={componentStyles.wrapperView}>
      <FlatList
        data={courses}
        keyExtractor={course => course.id}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={
          !isLoading && !hasResults ? (
            <Text style={componentStyles.emptyText}>
              No results yet. Try completing a course to see your results here.
            </Text>
          ) : null
        }
        renderItem={({ item: course }) => (
          <CourseResultsItem
            key={course.id}
            course={course}
            unitResults={unitResults}
            isExpanded={expandedCourseId === course.id}
            onToggle={() => toggleCourseExpansion(course.id)}
          />
        )}
      />
    </SafeAreaView>
  );
});

export default StudentsResultsScreen;
