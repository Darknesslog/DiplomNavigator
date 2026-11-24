import { fetchSupervisorDashboard } from "./supervisorDashboard";
import { toTopicCreateRequest } from "./supervisorContracts";
import {
  MOCK_SUPERVISOR_TOPICS,
  categories,
  directions,
  periods,
} from "../mocks/supervisorTopics";
import type {
  SupervisorTopic,
  CreateSupervisorTopic,
  TopicDirectories,
} from "../../entities/topic/supervisorTopics";
export async function fetchTopicDirectories(): Promise<TopicDirectories> {
  return structuredClone({ categories, directions, periods });
}
let topics = structuredClone(MOCK_SUPERVISOR_TOPICS);
export async function fetchSupervisorTopics(): Promise<SupervisorTopic[]> {
  const { students } = await fetchSupervisorDashboard();
  return structuredClone(
    topics.map((t) => ({
      ...t,
      studentIds: students.filter((s) => s.topicId === t.id).map((s) => s.id),
    })),
  );
}
export async function createSupervisorTopic(
  input: CreateSupervisorTopic,
  files: File[],
): Promise<SupervisorTopic> {
  const { title, description } = toTopicCreateRequest(input);
  if (
    !periods.some((p) => p.id === input.period_id) ||
    !title ||
    title.length > 500 ||
    !description ||
    description.length > 2000 ||
    !categories.includes(input.category) ||
    !directions.includes(input.direction)
  )
    throw new Error("Проверьте поля формы");
  const topic: SupervisorTopic = {
    ...input,
    title,
    description,
    id: Math.max(0, ...topics.map((t) => t.id)) + 1,
    status: "draft",
    studentIds: [],
    fileNames: files.map((f) => f.name),
  };
  topics = [...topics, topic];
  return structuredClone(topic);
}
