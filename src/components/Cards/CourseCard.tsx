import { Feather, Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { ScoreDetails, UnitResult } from '../../app/(students)/results';
import * as courseApi from '../../services/service';
import { useStore } from '../../store/context';
import { Course } from '../../utils/types';

const horizontalInsets = 24;

const getCardWidth = (width: number, height: number) => {
  const isLandscape = width > height;
  return isLandscape
    ? width / 2 - horizontalInsets * 2
    : width - horizontalInsets * 2;
};

export type ScoreTotals = {
  achievedScore: number;
  maxScore: number;
};

const getStatusTextColor = (status: string) => {
  if (status === 'New') {
    return '#007AFF';
  }
  return '#AFAFAF';
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E6FBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentWrapper: {
    flexDirection: 'column',
    flexShrink: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    lineHeight: 22,
    marginBottom: 2,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  resultsDetail: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: getStatusTextColor('New'),
    marginRight: 4,
  },
  rightSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface CourseCardProps {
  title: string;
  status: string;
  onPress: (event: GestureResponderEvent) => void;
  onPressStatus?: (event: GestureResponderEvent) => void;
  index?: number;
  item?: Course;
}

const CourseCard: React.FC<CourseCardProps> = observer(
  ({ title, status, onPress, onPressStatus, item }) => {
    const { t } = useTranslation();
    const { width, height } = useWindowDimensions();
    const cardWidth = getCardWidth(width, height);
    const displayStatus = status.toUpperCase();
    const { appStateStore } = useStore();
    const [scores, setScores] = useState<ScoreTotals | undefined>();

    const userId = appStateStore.user?.userId;

    const isTeacher = appStateStore.isTeacher();

    const fetchCourseResults = useCallback(
      async (course: Course) => {
        const requests = course.units.map(async (unit): Promise<UnitResult> => {
          try {
            const res = await courseApi.getUnitResult(
              course.id,
              userId ?? '',
              unit.contentHash,
            );
            return {
              courseId: course.id,
              unitId: unit.contentHash,
              result: res.data,
            };
          } catch (error) {
            console.error(
              `Error fetching result for Unit ${unit.contentHash}:`,
              error,
            );
            return {
              courseId: course.id,
              unitId: unit.contentHash,
              result: null,
            };
          }
        });

        return Promise.all(requests);
      },
      [userId],
    );

    const calculateTotalScores = (allResults: UnitResult[]): ScoreTotals => {
      return allResults.reduce(
        (acc, unitResult) => {
          const resultData = unitResult.result;

          if (resultData === null) {
            return acc;
          }

          let unitAchieved = 0;
          let unitMax = 0;

          if (
            !Array.isArray(resultData) &&
            typeof resultData === 'object' &&
            resultData !== null &&
            'score' in resultData
          ) {
            unitAchieved = resultData.score;
            unitMax = resultData.maxScore;
          } else if (Array.isArray(resultData)) {
            const allDetails: ScoreDetails[] = resultData.flatMap(
              sectionBreakdown => Object.values(sectionBreakdown),
            );

            unitAchieved = allDetails.reduce(
              (sum, detail) => sum + detail.raw,
              0,
            );
            unitMax = allDetails.reduce((sum, detail) => sum + detail.max, 0);
          }

          acc.achievedScore += unitAchieved;
          acc.maxScore += unitMax;

          return acc;
        },
        { achievedScore: 0, maxScore: 0 },
      );
    };

    useEffect(() => {
      (async () => {
        try {
          if (item && !isTeacher) {
            const allResults = await fetchCourseResults(item);
            const res = calculateTotalScores(allResults);
            setScores(res);
          }
        } catch (e) {
          console.error('Error fetching course results:', e);
        }
      })();
    }, [fetchCourseResults, isTeacher, item]);

    return (
      <TouchableOpacity onPress={onPress}>
        <View style={[styles.cardContainer, { width: cardWidth }]}>
          <View style={styles.leftSection}>
            <View style={styles.iconCircle}>
              <Feather
                name="file-text"
                size={24}
                color={getStatusTextColor('New')}
              />
            </View>

            <View style={styles.contentWrapper}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {isTeacher && scores && (
                <View style={styles.resultsRow}>
                  <Text style={styles.resultsText}>
                    {t('card.course.results')}
                  </Text>
                  <Ionicons name="checkmark-circle" size={16} color="#34C759" />

                  <Text style={styles.resultsDetail}>
                    {scores?.achievedScore} ({scores?.maxScore})
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={e => {
                  if (isTeacher) {
                    onPressStatus?.(e);
                  } else {
                    Toast.show({
                      type: 'info',
                      text1: t('card.course.toast_title'),
                      text2: t('card.course.toast_msg', { status }),
                    });
                  }
                }}
              >
                <View style={styles.statusTag}>
                  <Text style={styles.statusText}>{displayStatus}</Text>
                  {isTeacher && (
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={getStatusTextColor(status)}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rightSection}>
            <Ionicons name="chevron-forward" size={24} color="#C7C7C7" />
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

export default CourseCard;
