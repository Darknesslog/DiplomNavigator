// src/entities/application/types.ts
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'expired';

export interface Application {
  id: number;
  student_id: number;
  topic_id: number;
  status: ApplicationStatus;
  motivation: string | null;
  created_at: string;
  // Для UI
  student_name?: string;
  student_group?: string;
  topic_title?: string;
}