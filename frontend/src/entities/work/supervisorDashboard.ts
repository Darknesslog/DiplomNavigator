export type WorkStatus = "in_progress" | "review" | "completed";
export interface StageHistory {
  stage: string;
  date: string;
  comment?: string;
  fileName?: string;
}
export interface DashboardStudent {
  topic: string;
  topicId: number;
  assignmentId: number;
  stage: string;
  progress: number;
  defenseDate: string | null;
  history: StageHistory[];
  id: number;
  name: string;
  group: string;
  status: WorkStatus;
}
export type AttentionReason =
  "no_progress" | "missed_consultation" | "no_activity";
export interface AttentionItem {
  reasonCode: AttentionReason;
  studentId: number;
  reason: string;
  description: string;
  priority: number;
  date: string;
}
export interface DashboardEvent {
  id: number;
  studentId: number;
  date: string;
  description: string;
  status: WorkStatus;
}
export interface SupervisorDashboard {
  stages: StageOption[];
  students: DashboardStudent[];
  attention: AttentionItem[];
  events: DashboardEvent[];
}
export interface StageOption {
  label: string;
  progress: number;
  backendStage:
    "in_progress" | "under_review" | "admitted_to_defense" | "defended";
}
export interface StageChange {
  stage: string;
  comment?: string;
  file?: File;
}
