import type { TopicStatus } from "./types";
export interface SupervisorTopic {
  id: number;
  period_id: number;
  title: string;
  description: string;
  requirements: string;
  category: string;
  direction: string;
  status: TopicStatus;
  studentIds: number[];
  fileNames: string[];
}
export type CreateSupervisorTopic = Pick<
  SupervisorTopic,
  | "period_id"
  | "title"
  | "description"
  | "requirements"
  | "category"
  | "direction"
>;
export interface TopicDirectories {
  categories: string[];
  directions: string[];
  periods: { id: number; label: string }[];
}
