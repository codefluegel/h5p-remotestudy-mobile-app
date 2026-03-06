import { ListItem } from '@rneui/themed';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UnitResultData } from '../../app/(students)/results';
import { Course } from '../../utils/types';
import { ResultsTable } from './ResultsTable';

const styles = StyleSheet.create({
  courseContainer: {
    marginTop: 10,
    borderRadius: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  accordionHeader: {
    backgroundColor: 'white',
  },
  courseContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  courseName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#34495E',
    flex: 1,
  },
  courseNameGroup: {
    flex: 1,
  },
  unitListWrapper: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  unitContainer: {
    marginLeft: 0,
    marginTop: 10,
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#A9CCE3',
    paddingLeft: 10,
    backgroundColor: '#FBFCFC',
    borderRadius: 5,
    marginBottom: 5,
  },
  unitName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 5,
    color: '#5D6D7E',
  },
});

export type UnitResult = {
  courseId: string;
  unitId: string;
  result: UnitResultData;
  unitName?: string;
  userId?: string;
};

type CourseResultsItemProps = {
  course: Course;
  unitResults: UnitResult[];
  isExpanded: boolean;
  onToggle: () => void;
};

/**
 * Displays a single course with its unit results in an accordion
 */
export function CourseResultsItem({
  course,
  unitResults,
  isExpanded,
  onToggle,
}: CourseResultsItemProps) {
  return (
    <View style={styles.courseContainer}>
      <ListItem.Accordion
        content={
          <ListItem.Content style={styles.courseContentContainer}>
            <View style={styles.courseNameGroup}>
              <ListItem.Title style={styles.courseName}>
                {course.name}
              </ListItem.Title>
            </View>
          </ListItem.Content>
        }
        isExpanded={isExpanded}
        onPress={onToggle}
        containerStyle={styles.accordionHeader}
      >
        <View style={styles.unitListWrapper}>
          {course.units.map(unit => {
            const unitResult = unitResults.find(
              r => r.courseId === course.id && r.unitId === unit.contentHash,
            );
            return (
              <View key={unit.contentId} style={styles.unitContainer}>
                <Text style={styles.unitName}>{unit.name}</Text>
                <ResultsTable unitResultData={unitResult?.result ?? null} />
              </View>
            );
          })}
        </View>
      </ListItem.Accordion>
    </View>
  );
}

export default CourseResultsItem;
