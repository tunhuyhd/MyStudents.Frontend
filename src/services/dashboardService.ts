import api from '@/lib/api';

export interface DashboardSession {
  id: string;
  classId: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  status: number;
  studentCount: number;
  pendingAttendanceCount: number;
}

export interface TeacherDashboard {
  today: string;
  generatedAt: string;
  activeClassCount: number;
  activeStudentCount: number;
  pendingSessionCount: number;
  upcomingSessionCount: number;
  todaySessions: DashboardSession[];
  pendingSessions: DashboardSession[];
  upcomingSessions: DashboardSession[];
}

export const dashboardService = {
  get: (signal?: AbortSignal) => api.get<TeacherDashboard>('/classes/dashboard', { signal }),
};
