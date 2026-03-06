import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UnitResult, UnitResultData } from '../(students)/results';
import ObserverList from '../../components/Cards/ObserverList';
import Theme from '../../constants/Theme';
import * as courseApi from '../../services/service';
import { useStore } from '../../store/context';

const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    width: '100%',
  },
  unitContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unitName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userIdText: {
    fontSize: 16,
    color: '#555',
    flex: 1, // Take available space
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.PRIMARY_COLOR,
    marginLeft: 10,
  },
  noResultsText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#888',
    marginTop: 10,
  },
  noUnitsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
    marginTop: 50,
  },
  listContent: {
    paddingBottom: 20,
  },
});

type UserScoreDetail = {
  userId: string;
  rawScore: number;
  totalScore: number;
};

type RestructuredResults = {
  [unitName: string]: UnitScoresArray;
};

type UnitDataItem = {
  unitName: string;
  users: UserScoreDetail[];
};

type UnitScoresArray = UserScoreDetail[];

const CourseStatisticsScreen = observer(() => {
  const navigation = useNavigation();
  const { courseId } = useLocalSearchParams();
  const { t } = useTranslation();

  const { courseStore } = useStore();
  const course = courseStore.getCourse(String(courseId) ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const [restructuredResults, setRestructuredResults] =
    useState<RestructuredResults>({});

  useEffect(() => {
    navigation.setOptions({
      title: `${course?.name ?? ''} Stats`,
      headerBackTitle: 'Back',
    });
  }, [navigation, course]);

  const fetchAndRestructureResults = useCallback(async () => {
    if (!course) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await courseApi.getCourseResults(course.id);
      if (res.data) {
        const successfulResults: UnitResult[] = [];

        Object.entries(res.data).forEach(([, userData]) => {
          Object.entries(userData.unit).forEach(([unitId, unitResultData]) => {
            const unitName = unitId;
            successfulResults.push({
              courseId: course.id,
              unitId,
              unitName,
              userId: userData.email,
              result: unitResultData as UnitResultData,
            });
          });
        });

        const newRestructuredResults: RestructuredResults = {};

        successfulResults.forEach(item => {
          const unitIdentifier = item.unitName;
          if (unitIdentifier) {
            if (!newRestructuredResults[unitIdentifier]) {
              newRestructuredResults[unitIdentifier] = [];
            }

            let rawScore = 0;
            let totalScore = 0;

            if (Array.isArray(item.result)) {
              const lastEntry = item.result[item.result.length - 1];
              if (lastEntry) {
                rawScore = Object.values(lastEntry).reduce(
                  (sum, score) => sum + score.raw,
                  0,
                );
                totalScore = Object.values(lastEntry).reduce(
                  (sum, score) => sum + score.max,
                  0,
                );
              }
            } else if (
              typeof item.result === 'object' &&
              item.result !== null &&
              'score' in item.result &&
              'maxScore' in item.result
            ) {
              rawScore = item.result.score;
              totalScore = item.result.maxScore;
            }

            newRestructuredResults[unitIdentifier].push({
              userId: item.userId ?? '',
              rawScore,
              totalScore,
            });
          }
        });
        setRestructuredResults(newRestructuredResults);
      }
    } catch (err) {
      console.error('Overall error fetching results:', err);
    } finally {
      setIsLoading(false);
    }
  }, [course]);

  // Refetch results when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (course) {
        fetchAndRestructureResults();
      }
    }, [course, fetchAndRestructureResults]),
  );

  const unitsData: UnitDataItem[] = Object.keys(restructuredResults).map(
    unitName => ({
      unitName,
      users: restructuredResults[unitName],
    }),
  );

  const renderUserItem = ({ item }: { item: UserScoreDetail }) => {
    if (item.rawScore === 0 && item.totalScore === 0) {
      return <View />;
    }
    return (
      <View style={styles.userRow}>
        <Text style={styles.userIdText}>{item.userId}:</Text>
        <Text style={styles.scoreText}>
          {item.rawScore} / {item.totalScore}
        </Text>
      </View>
    );
  };
  const moveToDetailCourse = (unitName: string) => {
    console.log(unitName);
  };

  const renderUnitItem = ({
    item,
  }: {
    item: { unitName: string; users: UnitScoresArray };
  }) => (
    <View style={styles.unitContainer}>
      <TouchableOpacity onPress={() => moveToDetailCourse(item.unitName)}>
        <Text style={styles.unitName}>
          {course?.units.find(unit => unit.contentHash === item.unitName)?.name}
        </Text>
        <ObserverList
          data={item.users}
          renderItem={renderUserItem}
          keyExtractor={userItem => userItem.userId}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.noResultsText}>
              {t('statistics.empty.no_results')}
            </Text>
          }
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.wrapperView}>
      <View style={styles.container}>
        {unitsData.length > 0 ? (
          <ObserverList
            data={unitsData}
            renderItem={renderUnitItem}
            keyExtractor={userItem => userItem.unitName}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={fetchAndRestructureResults}
              />
            }
            ListEmptyComponent={
              <Text style={styles.noUnitsText}>
                {t('statistics.empty.no_units')}
              </Text>
            }
          />
        ) : (
          <Text style={styles.noUnitsText}>
            {t('statistics.empty.no_units')}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
});

export default CourseStatisticsScreen;
