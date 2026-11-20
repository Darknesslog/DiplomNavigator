// src/shared/api/supervisors.ts
import { MOCK_SUPERVISORS } from '../mocks/supervisors';
import type { SupervisorLoad } from '../mocks/supervisors';

export const fetchSupervisors = async (): Promise<SupervisorLoad[]> => {
  return MOCK_SUPERVISORS;
};