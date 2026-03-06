import { useCallback, useState } from 'react';
import * as courseApi from '../services/service';
import { Course } from '../utils/types';

export type UnitResultData =
  | Array<{ [sectionName: string]: { raw: number; max: number } }>
  | { score: number; maxScore: number }
  | null;

export type UnitResult = {
  courseId: string;
  unitId: string;
  result: UnitResultData;
  unitName?: string;
  userId?: string;
};

export const useCourseResults = (userId?: string, courses?: Course[]) => {
  const [unitResults, setUnitResults] = useState<UnitResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourseResults = useCallback(
    async (currentCourses: Course[], currentUserId: string) => {
      if (!currentUserId || currentCourses.length === 0) {
        return [];
      }

      const requests = currentCourses.flatMap(course =>
        course.units.map(unit =>
          (async (): Promise<UnitResult> => {
            try {
              const res = await courseApi.getUnitResult(
                course.id,
                currentUserId,
                unit.contentHash,
              );
              return {
                courseId: course.id,
                unitId: unit.contentHash,
                result: res.data,
              };
            } catch {
              return {
                courseId: course.id,
                unitId: unit.contentHash,
                result: null,
              };
            }
          })(),
        ),
      );

      return Promise.all(requests);
    },
    [],
  );

  const refetch = useCallback(async () => {
    if (!userId || !courses || courses.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const allResults = await fetchCourseResults(courses, userId);
      setUnitResults(allResults);
    } catch (err) {
      const caughtError = err instanceof Error ? err : new Error(String(err));
      setError(caughtError);
    } finally {
      setIsLoading(false);
    }
  }, [userId, courses, fetchCourseResults]);

  return {
    unitResults,
    isLoading,
    error,
    refetch,
  };
};

export default useCourseResults;
