// src/entities/work/types.ts
export type AssignmentStage = 'in_progress' | 'under_review' | 'admitted_to_defense' | 'defended';

export interface Work {
  id: number;
  student_id: number;
  topic_id: number;
  status: 'active' | 'completed' | 'cancelled';
  progress_percent: number;
  current_stage: AssignmentStage;
  // Для UI
  title?: string;
  supervisor_name?: string;
}