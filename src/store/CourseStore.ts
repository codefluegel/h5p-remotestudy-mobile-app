import { makeAutoObservable, runInAction } from 'mobx';
import Toast from 'react-native-toast-message';
import * as courseApi from '../services/service';
import { Course, Label, Unit, XAPIResult } from '../utils/types';
import persistStore from './PersistStore';

export type UnsyncedResult = {
  courseId: string;
  userId: string;
  contentHash: string;
  results: XAPIResult[];
};

class CourseStore {
  courses: Course[] = [];

  unsyncedResults: UnsyncedResult[] = [];

  isLoading = false;

  constructor(persistenceKey?: string) {
    makeAutoObservable(this, {
      fetchCourses: false,
    });
    if (persistenceKey) {
      persistStore(this, ['courses', 'unsyncedResults'], persistenceKey);
    }
  }

  clearCourses() {
    this.courses = [];
    this.unsyncedResults = [];
  }

  async syncUnsyncedResults() {
    const resultsToSync = [...this.unsyncedResults];
    if (resultsToSync.length === 0) {
      return;
    }

    Toast.show({
      type: 'info',
      text1: `Syncing ${resultsToSync.length} pending results...`,
    });

    const syncPromises = resultsToSync.map(
      async ({ courseId, userId, contentHash, results }) => {
        await courseApi.saveUnitResult(courseId, userId, contentHash, results);
        return { courseId, userId, contentHash, results };
      },
    );

    try {
      const settledPromises = await Promise.allSettled(syncPromises);

      const successfullySynced = settledPromises
        .filter(p => p.status === 'fulfilled')
        .map(p => (p as PromiseFulfilledResult<UnsyncedResult>).value);

      this.unsyncedResults = this.unsyncedResults.filter(
        unsynced =>
          !successfullySynced.some(
            synced =>
              synced.courseId === unsynced.courseId &&
              synced.contentHash === unsynced.contentHash &&
              synced.userId === unsynced.userId,
          ),
      );

      const failedCount = settledPromises.length - successfullySynced.length;
      if (failedCount > 0) {
        Toast.show({
          type: 'error',
          text1: `${failedCount} results could not be synced. Will try again later.`,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'All pending results have been synced.',
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'An error occurred during sync. Will try again later.',
      });
    }
  }

  async fetchCourses(role: string) {
    runInAction(() => {
      this.isLoading = true;
    });

    try {
      const { data: allCoursesMap } = await courseApi.getAllCourses(role);
      const allCourses = Object.values(allCoursesMap);
      if (allCoursesMap.length > 0) {
        const courseContents = await Promise.all(
          allCourses
            .map(async course => {
              const res = await courseApi.getCourseContent(course.id);
              return res.data;
            })
            .filter((c): c is NonNullable<typeof c> => c !== null),
        );

        courseContents.forEach(element => {
          this.addCourse(element);
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Failed to fetch course',
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async saveCourse(content: Course) {
    this.isLoading = true;
    try {
      const { isDownloaded, ...contentForSave } = content;
      await courseApi.saveCourse(content.id, contentForSave);
      Toast.show({
        type: 'success',
        text1: 'Course saved',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Failed to save course',
      });
    } finally {
      this.isLoading = false;
    }
  }

  async deleteCourse(courseId: string) {
    this.isLoading = true;
    try {
      await courseApi.deleteCourse(courseId);
      Toast.show({
        type: 'success',
        text1: 'Course deleted',
      });
      this.courses = this.courses.filter(c => c.id !== courseId);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Failed to delete course',
      });
    } finally {
      this.isLoading = false;
    }
  }

  getCourse(courseId: string) {
    return this.courses.find(c => c.id === courseId);
  }

  addCourse(course: Course) {
    const exists = this.getCourse(course.id);
    if (!exists) {
      this.courses.push(course);
    }
  }

  addUnitToCourse(courseId: string, unit: Unit) {
    const course = this.getCourse(courseId);
    if (course) {
      course.units ??= [];
      course.units.push(unit);
    }
  }

  addLabelToCourse(courseId: string, label: Label) {
    const course = this.getCourse(courseId);
    if (course) {
      course.labels ??= [];
      course.labels.push(label);
      this.saveCourse(course);
    }
  }

  updateCourseById(id: string, updatedCourse: Partial<Course>) {
    const index = this.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.courses[index] = {
        ...this.courses[index],
        ...updatedCourse,
      };
    }
  }

  updateUnit(courseId: string, contentId: number, updatedUnit: Partial<Unit>) {
    const course = this.getCourse(courseId);
    if (!course?.units) return;

    const index = course.units.findIndex(unit => unit.contentId === contentId);
    if (index !== -1) {
      course.units[index] = {
        ...course.units[index],
        ...updatedUnit,
      };
    }
    this.saveCourse(course);
  }
}

export default CourseStore;
