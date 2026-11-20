// src/shared/api/applications.ts
import { MOCK_APPLICATIONS } from '../mocks/applications';
import type { Application } from '../../entities/application/types';

export const fetchApplications = async (): Promise<Application[]> => {
  return MOCK_APPLICATIONS;
};