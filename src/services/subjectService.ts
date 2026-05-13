import api from '@/lib/api';

export interface Subject {
  id: string;
  name: string;
  description: string;
}

export const subjectService = {
  getAll: () => api.get<Subject[]>('/subjects'),
  getById: (id: string) => api.get<Subject>(`/subjects/${id}`),
  create: (data: Omit<Subject, 'id'>) => api.post<string>('/subjects', data),
  update: (id: string, data: Subject) => api.put(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
};
