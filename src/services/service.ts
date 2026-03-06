import { UnitResultData } from '../app/(students)/results';
import { Course, CourseBasic, XAPIResult } from '../utils/types';
import apiClient from './apiClient';

export const getAllCourses = (role: string) =>
  apiClient.get<CourseBasic[]>(`/course?role=${role.toLowerCase()}`);

export const getCourseContent = (courseId: string) =>
  apiClient.get<Course>(`/course/${courseId}/content`);

export const deleteCourse = (courseId: string) =>
  apiClient.delete<void>(`/course/${courseId}`);

export const saveCourse = (courseId: string, content: Course) =>
  apiClient.put(`/course/${courseId}/content`, content);

export const getInviteEmails = async (courseId: string): Promise<string[]> => {
  const res = await apiClient.get(`/course/${courseId}/inviteUserEmail`);
  return res.data ?? [];
};

export const addInviteEmail = (courseId: string, email: string) =>
  apiClient.post(`/course/${courseId}/inviteUserEmail`, { email });

export const deleteInviteEmail = (courseId: string, email: string) =>
  apiClient.delete(`/course/${courseId}/inviteUserEmail/${email}`);

export const saveUnitResult = (
  courseId: string,
  userId: string,
  hash: string,
  results: XAPIResult[],
) =>
  apiClient.put(`/course/${courseId}/result/${userId}/unit/${hash}`, results);

export const getUnitResult = (
  courseId: string,
  userId: string,
  unitId: string,
) =>
  apiClient.get<UnitResultData>(
    `/course/${courseId}/result/${userId}/unit/${unitId}`,
  );

export const getCourseResults = (courseId: string) =>
  apiClient.get<UnitResultData>(`/course/${courseId}/result/`);

export const createFileUrl = (filename: string) =>
  apiClient.post<{ uploadUrl: string; downloadUrl: string }>(`/file/url`, {
    filename,
  });

export default apiClient;
