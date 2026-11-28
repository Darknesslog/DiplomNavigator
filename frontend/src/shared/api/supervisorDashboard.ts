import { apiClient } from './client';
import { toProgressRequest } from './supervisorContracts';
import type {
  DashboardEvent,
  DashboardStudent,
  StageChange,
  StageOption,
  SupervisorDashboard,
  WorkStatus,
} from '../../entities/work/supervisorDashboard';

interface BackendProgressHistory {
  changed_at: string;
  current_stage: StageOption['backendStage'];
  progress_percent: number;
  comment: string | null;
}

interface BackendAssignment {
  id: number;
  topic_id: number;
  progress_percent: number;
  current_stage: StageOption['backendStage'];
  current_stage_label: string;
  status: 'active' | 'completed' | 'cancelled';
  updated_at: string;
  student: {
    id: number;
    full_name: string;
    group_name: string;
  };
  topic: {
    id: number;
    title: string;
  };
  progress_history: BackendProgressHistory[];
}

const stages: StageOption[] = [
  { label: 'В работе', progress: 25, backendStage: 'in_progress' },
  { label: 'На проверке', progress: 50, backendStage: 'under_review' },
  { label: 'Допуск к защите', progress: 100, backendStage: 'admitted_to_defense' },
  { label: 'Завершено', progress: 100, backendStage: 'defended' },
];

const statusFor = (stage: BackendAssignment['current_stage']): WorkStatus => {
  if (stage === 'defended') return 'completed';
  if (stage === 'under_review' || stage === 'admitted_to_defense') return 'review';
  return 'in_progress';
};

const stageLabel = (stage: BackendAssignment['current_stage']): string =>
  stages.find((option) => option.backendStage === stage)?.label ?? 'В работе';

function mapAssignment(assignment: BackendAssignment): DashboardStudent {
  const history = assignment.progress_history.map((entry) => ({
    stage: stageLabel(entry.current_stage),
    date: entry.changed_at.slice(0, 10),
    comment: entry.comment ?? undefined,
  }));

  return {
    id: assignment.student.id,
    assignmentId: assignment.id,
    topicId: assignment.topic.id,
    topic: assignment.topic.title,
    stage: stageLabel(assignment.current_stage),
    progress: assignment.progress_percent,
    defenseDate: null,
    history,
    name: assignment.student.full_name,
    group: assignment.student.group_name,
    status: statusFor(assignment.current_stage),
  };
}

function mapEvents(students: DashboardStudent[]): DashboardEvent[] {
  return students.flatMap((student) =>
    student.history.map((entry, index) => ({
      id: student.assignmentId * 1000 + index,
      studentId: student.id,
      date: entry.date,
      description: entry.comment || `Этап работы изменён: ${entry.stage}`,
      status: student.status,
    })),
  ).sort((left, right) => right.date.localeCompare(left.date));
}

export async function fetchSupervisorDashboard(): Promise<SupervisorDashboard> {
  const assignments = await apiClient<BackendAssignment[]>('/supervisor/assignments');
  const students = assignments
    .filter((assignment) => assignment.status !== 'cancelled')
    .map(mapAssignment);

  return {
    stages,
    students,
    attention: [],
    events: mapEvents(students),
  };
}

export async function updateStudentStage(
  assignmentId: number,
  input: StageChange,
): Promise<SupervisorDashboard> {
  const option = stages.find((stage) => stage.label === input.stage);
  if (!option) throw new Error('Выберите допустимый этап работы');

  await apiClient(`/supervisor/assignments/${assignmentId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify(toProgressRequest(option, input)),
  });

  return fetchSupervisorDashboard();
}
