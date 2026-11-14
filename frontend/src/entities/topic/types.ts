// src/entities/topic/types.ts
export type TopicStatus = 'draft' | 'published' | 'rejected' | 'archived';

export interface Topic {
  id: number;
  title: string;
  description: string;
  status: TopicStatus;
  department_id: number | null;
  supervisor_id: number;
  company_name: string | null;
  // Для мока добавляем удобные поля, которых нет в API напрямую, 
  // но они нужны для UI (в реальном API они придут в вложенных объектах или отдельно)
  supervisor_name?: string;
  supervisor_degree?: string;
  is_free?: boolean; 
}