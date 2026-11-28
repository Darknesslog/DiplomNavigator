// src/entities/work/types.ts
export type AssignmentStage = 'in_progress' | 'under_review' | 'admitted_to_defense' | 'defended';

export interface Work {
  id: number;
  student_id: number;
  topic_id: number;
  status: 'active' | 'completed' | 'cancelled';
  progress_percent: number;
  current_stage: AssignmentStage;
  progress_history?: unknown[];
  // Для UI
  title?: string;
  supervisor_name?: string;
  topic?: { id: number; title: string; supervisor_id: number };
  student?: { id: number; full_name: string; group_name: string };
}