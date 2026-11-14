// src/shared/mocks/topics.ts
import type { Topic } from '../../entities/topic/types';

export const MOCK_TOPICS: Topic[] = [
  {
    id: 1,
    title: 'Автоматизация процесса распределения тем ВКР',
    description: 'Создание информационной системы для выбора тем.',
    status: 'published',
    department_id: 1,
    supervisor_id: 1,
    company_name: null,
    supervisor_name: 'Петров И.С.',
    supervisor_degree: 'Доцент, к.т.н.',
    is_free: true,
  },
  {
    id: 2,
    title: 'Применение алгоритмов машинного обучения',
    description: 'Прогнозирование успеваемости студентов.',
    status: 'published',
    department_id: 1,
    supervisor_id: 2,
    company_name: null,
    supervisor_name: 'Соколова Е.В.',
    supervisor_degree: 'Профессор, д.т.н.',
    is_free: false,
  },
];