import { apiClient } from './client';
import type { SupervisorLoad } from '../mocks/supervisors';

export const fetchSupervisors = async (): Promise<SupervisorLoad[]> => {
  const workloads = await apiClient<Array<{
    supervisor_id: number;
    full_name: string;
    email: string;
    department_name: string;
    current_load: number;
    max_students: number;
  }>>('/workload/supervisors');

  return workloads.map((workload) => ({
    id: workload.supervisor_id,
    name: workload.full_name,
    degree: workload.department_name,
    loadCurrent: workload.current_load,
    loadMax: workload.max_students,
    statusText: workload.current_load >= workload.max_students ? 'Заполнен' : 'Доступен',
    statusType: workload.current_load >= workload.max_students ? 'green' : 'yellow',
    students: [],
  }));
};
