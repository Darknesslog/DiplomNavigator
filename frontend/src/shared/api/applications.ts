// src/shared/api/applications.ts
import { apiClient } from './client';
import type { Application } from '../../entities/application/types';

export const fetchApplications = async (): Promise<Application[]> => {
  return apiClient<Application[]>('/applications/me');
};

export const fetchSupervisorApplications = async (): Promise<Application[]> => {
  const applications = await apiClient<Array<{
    id: number;
    student_id: number;
    topic_id: number;
    status: Application['status'];
    motivation: string | null;
    created_at: string;
    student: { id: number; full_name: string; group_name: string };
    topic: { id: number; title: string };
  }>>('/supervisor/applications');

  return applications.map((application) => ({
    ...application,
    student_name: application.student.full_name,
    student_group: application.student.group_name,
    topic_title: application.topic.title,
  }));
};

export const decideApplication = (
  applicationId: number,
  approved: boolean,
  comment = '',
) => apiClient(`/supervisor/applications/${applicationId}/${approved ? 'approve' : 'reject'}`, {
  method: 'PATCH',
  body: JSON.stringify({ comment: comment || null }),
});