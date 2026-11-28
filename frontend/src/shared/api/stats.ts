// src/shared/api/stats.ts
import { apiClient } from './client';
import type { ZavkaStats, SupervisorStats } from '../mocks/stats';

export const fetchZavkaStats = async (): Promise<ZavkaStats> => {
  const dashboard = await apiClient<{
    students_count: number;
    supervisors_count: number;
    active_assignments: number;
    pending_applications: number;
  }>('/dashboard/head');

  return {
    totalStudents: dashboard.students_count,
    totalSupervisors: dashboard.supervisors_count,
    inProgress: dashboard.active_assignments,
    preDefense: dashboard.pending_applications,
  };
};

export const fetchSupervisorStats = async (): Promise<SupervisorStats> => {
  const dashboard = await apiClient<{
    pending_applications: number;
  }>('/supervisor/dashboard');

  return {
    pendingApplications: dashboard.pending_applications,
    attentionRequired: 0,
  };
};

export interface SupervisorOverview {
  supervisor_id: number;
  full_name: string;
  department_name: string;
  current_load: number;
  max_students: number;
  available_places: number;
  topics_count: number;
  students_count: number;
  pending_applications: number;
}

export const fetchSupervisorOverview = async (): Promise<SupervisorOverview> => {
  return apiClient<SupervisorOverview>('/supervisor/dashboard');
};