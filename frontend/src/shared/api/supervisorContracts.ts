import type {
  StageOption,
  StageChange,
} from "../../entities/work/supervisorDashboard";
import type { CreateSupervisorTopic } from "../../entities/topic/supervisorTopics";
export interface AssignmentProgressRequest {
  current_stage: StageOption["backendStage"];
  progress_percent: number;
  comment: string | null;
}
export interface TopicCreateRequest {
  period_id: number;
  title: string;
  description: string;
  source: "teacher";
}
export function toProgressRequest(
  option: StageOption,
  input: StageChange,
): AssignmentProgressRequest {
  return {
    current_stage: option.backendStage,
    progress_percent: option.progress,
    comment: input.comment?.trim() || null,
  };
}
export function toTopicCreateRequest(
  input: CreateSupervisorTopic,
): TopicCreateRequest {
  return {
    period_id: input.period_id,
    title: input.title.trim(),
    description: input.description.trim(),
    source: "teacher",
  };
}
