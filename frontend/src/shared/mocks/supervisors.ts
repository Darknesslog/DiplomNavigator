// src/shared/mocks/supervisors.ts
export interface SupervisorLoad {
  id: number;
  name: string;
  degree: string;
  loadCurrent: number;
  loadMax: number;
  statusText: string;
  statusType: 'green' | 'yellow';
  students: {
    id: number;
    name: string;
    group: string;
    topic: string;
    progress: number;
    stage: string;
  }[];
}

export const MOCK_SUPERVISORS: SupervisorLoad[] = [
  {
    id: 1,
    name: 'Соколова Елена Викторовна',
    degree: 'Кандидат технических наук',
    loadCurrent: 12,
    loadMax: 12,
    statusText: 'Заполнен',
    statusType: 'green',
    students: [
      { id: 101, name: 'Александров Игорь', group: 'БИ-20-01', topic: 'Автоматизация склада', progress: 90, stage: 'Предзащита' },
    ],
  },
  {
    id: 2,
    name: 'Морозов Андрей Сергеевич',
    degree: 'Доктор технических наук',
    loadCurrent: 6,
    loadMax: 10,
    statusText: 'Доступен',
    statusType: 'yellow',
    students: [
      { id: 201, name: 'Васильев Алексей', group: 'БИ-20-02', topic: 'Микросервисы', progress: 60, stage: 'В работе' },
    ],
  },
];