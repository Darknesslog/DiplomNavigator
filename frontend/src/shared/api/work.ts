// src/shared/api/work.ts
import { apiClient } from './client';
import type { Work } from '../../entities/work/types';

export const fetchMyWork = async (): Promise<Work[]> => {
  const works = await apiClient<Work[]>('/works/me');
  const supervisors = await apiClient<Array<{
    supervisor_id: number | null;
    first_name: string;
    last_name: string;
    middle_name: string | null;
  }>>('/supervisors');

  const names = new Map(
    supervisors
      .filter((supervisor) => supervisor.supervisor_id !== null)
      .map((supervisor) => [
        supervisor.supervisor_id as number,
        [supervisor.last_name, supervisor.first_name, supervisor.middle_name]
          .filter(Boolean)
          .join(' '),
      ]),
  );

  return works.map((work) => ({
    ...work,
    title: work.topic?.title,
    supervisor_name: work.topic?.supervisor_id
      ? names.get(work.topic.supervisor_id)
      : undefined,
  }));
};