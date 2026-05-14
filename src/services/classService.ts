import api from '@/lib/api';

export interface ClassSchedule {
  id?: string;
  dayOfWeek: number; // 0: Sunday, 1: Monday, ...
  startTime: string; // "HH:mm:ss"
  durationHours: number;
}

export interface Class {
  id: string;
  name: string;
  code: string;
  status: number; // 1: Active, 2: Inactive, 3: Completed, 4: Cancelled
  category: number; // 0: Online, 1: Offline
  subjectId: string;
  subjectName: string;
  studentCount: number;
  startDate: string;
  expectedEndDate: string;
  schedules: ClassSchedule[];
}

export interface CreateClassData {
  name: string;
  code: string;
  status: number;
  category: number;
  subjectId: string;
  startDate: string;
  expectedEndDate: string;
  schedules: Omit<ClassSchedule, 'id'>[];
}

export const classService = {
  getAll: () => api.get<Class[]>('/classes'),
  getById: (id: string) => api.get<Class>(`/classes/${id}`),
  create: (data: CreateClassData) => api.post<string>('/classes', data),
  update: (id: string, data: CreateClassData & { id: string }) => api.put(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
  addStudent: (classId: string, studentId: string) => api.post<boolean>(`/classes/${classId}/students`, studentId, {
    headers: { 'Content-Type': 'application/json' }
  }),
  updateStudentStatus: (classId: string, studentId: string, status: number) => 
    api.put<boolean>(`/classes/${classId}/students/${studentId}`, status, {
      headers: { 'Content-Type': 'application/json' }
    }),
  removeStudent: (classId: string, studentId: string) => api.delete<boolean>(`/classes/${classId}/students/${studentId}`),
  getAvailableStudents: (classId: string, searchTerm: string = '') => 
    api.get<any[]>(`/classes/${classId}/available-students?searchTerm=${searchTerm}`),
};
