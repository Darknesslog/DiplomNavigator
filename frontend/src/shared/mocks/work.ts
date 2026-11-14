// src/shared/mocks/work.ts
import type { Work } from '../../entities/work/types';

export const MOCK_MY_WORK: Work = {
  id: 1,
  student_id: 1,
  topic_id: 2,
  status: 'active',
  progress_percent: 65,
  current_stage: 'under_review',
  title: 'Применение алгоритмов машинного обучения',
  supervisor_name: 'Соколова Елена Викторовна',
};