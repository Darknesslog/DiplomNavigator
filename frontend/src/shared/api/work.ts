// src/shared/api/work.ts
import { MOCK_MY_WORK } from '../mocks/work';
import type { Work } from '../../entities/work/types';

export const fetchMyWork = async (): Promise<Work> => {
  return MOCK_MY_WORK;
};