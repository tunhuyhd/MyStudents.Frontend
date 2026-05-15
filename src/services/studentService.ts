import api from '@/lib/api';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth?: string;
  gender: number; // 0: Male, 1: Female, 2: Other
  school?: string;
  parentName?: string;
  parentPhone?: string;
  phone?: string;
  address?: string;
  note?: string;
  status: number; // 1: Active, 2: Inactive
  createdOn: string;
}

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth?: string;
  gender: number;
  school?: string;
  parentName?: string;
  parentPhone?: string;
  phone?: string;
  address?: string;
  note?: string;
}

export const studentService = {
  getAll: () => api.get<Student[]>('/students'),
  getById: (id: string) => api.get<Student>(`/students/${id}`),
  create: (data: CreateStudentData) => api.post<string>('/students', data),
  update: (id: string, data: CreateStudentData & { id: string }) => api.put(`/students/${id}`, data),
  updateStatus: (id: string, status: number) => api.patch(`/students/${id}/status`, { id, status }),
  delete: (id: string) => api.delete(`/students/${id}`),
};
