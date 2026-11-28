import type { WorkStatus } from '../../entities/work/supervisorDashboard';

export const statusLabels: Record<WorkStatus, string> = {
  in_progress: 'В работе',
  review: 'На проверке',
  completed: 'Завершено',
};
