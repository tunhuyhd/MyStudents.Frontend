import api from '@/lib/api';

export interface Class {
  id: string;
  name: string;
  code: string;
  category: number; // 0: Online, 1: Offline
  subjectId: string;
  subjectName: string;
  studentCount: number;
}

export interface CreateClassData {
  name: string;
  code: string;
  category: number;
  subjectId: string;
}

export const classService = {
  getAll: () => api.get<Class[]>('/classes'),
  getById: (id: string) => api.get<Class>(`/classes/${id}`),
  create: (data: CreateClassData) => api.post<string>('/classes', data),
  update: (id: string, data: CreateClassData & { id: string }) => api.put(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
};
