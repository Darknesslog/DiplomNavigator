// src/shared/mocks/stats.ts
export interface ZavkaStats {
  totalStudents: number;
  totalSupervisors: number;
  inProgress: number;
  preDefense: number;
}

export const MOCK_ZAVKA_STATS: ZavkaStats = {
  totalStudents: 128,
  totalSupervisors: 14,
  inProgress: 84,
  preDefense: 32,
};

export interface SupervisorStats {
  pendingApplications: number;
  attentionRequired: number;
}

export const MOCK_SUPERVISOR_STATS: SupervisorStats = {
  pendingApplications: 4,
  attentionRequired: 3,
};