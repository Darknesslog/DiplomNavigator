// src/shared/api/stats.ts
import { MOCK_ZAVKA_STATS } from '../mocks/stats';
import type { ZavkaStats } from '../mocks/stats';

export const fetchZavkaStats = async (): Promise<ZavkaStats> => {
  return MOCK_ZAVKA_STATS;
};

import { MOCK_SUPERVISOR_STATS } from '../mocks/stats';
import type { SupervisorStats } from '../mocks/stats';

export const fetchSupervisorStats = async (): Promise<SupervisorStats> => {
  return MOCK_SUPERVISOR_STATS;
};