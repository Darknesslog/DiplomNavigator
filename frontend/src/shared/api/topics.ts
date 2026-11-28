// src/shared/api/topics.ts
import { apiClient } from './client';
import type { Topic } from '../../entities/topic/types';

export const fetchTopics = async (): Promise<Topic[]> => {
  const [topics, supervisors] = await Promise.all([
    apiClient<Topic[]>('/topics'),
    apiClient<Array<{
      supervisor_id: number | null;
      first_name: string;
      last_name: string;
      middle_name: string | null;
    }>>('/supervisors'),
  ]);

  const supervisorNames = new Map(
    supervisors
      .filter((supervisor) => supervisor.supervisor_id !== null)
      .map((supervisor) => [
        supervisor.supervisor_id as number,
        [supervisor.last_name, supervisor.first_name, supervisor.middle_name]
          .filter(Boolean)
          .join(' '),
      ]),
  );

  return topics.map((topic) => ({
    ...topic,
    supervisor_name: supervisorNames.get(topic.supervisor_id) || 'Руководитель не указан',
    is_free: topic.status === 'published' && !topic.is_reserved,
  }));
};

export const applyForTopic = async (
  topicId: number,
  motivation?: string,
) => apiClient(`/topics/${topicId}/applications`, {
  method: 'POST',
  body: JSON.stringify({ motivation: motivation || null }),
});