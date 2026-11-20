// src/shared/mocks/applications.ts
import type { Application } from '../../entities/application/types';

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 1,
    student_id: 1,
    topic_id: 1,
    status: 'pending',
    motivation: 'Хочу реализовать эту тему.',
    created_at: '2026-11-14T10:00:00Z',
    student_name: 'Иванов Алексей',
    student_group: 'ИС-41',
    topic_title: 'Автоматизация процесса распределения тем ВКР',
  },
  {
    id: 2,
    student_id: 2,
    topic_id: 2,
    status: 'pending',
    motivation: 'Интересна тема ИИ.',
    created_at: '2026-11-14T11:00:00Z',
    student_name: 'Козлова Анна',
    student_group: 'ПИ-41',
    topic_title: 'Применение алгоритмов машинного обучения',
  },
];