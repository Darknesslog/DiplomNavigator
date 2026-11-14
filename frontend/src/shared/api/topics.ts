// src/shared/api/topics.ts
import { MOCK_TOPICS } from '../mocks/topics';
import type { Topic } from '../../entities/topic/types';

export const fetchTopics = async (): Promise<Topic[]> => {
  return MOCK_TOPICS;
};