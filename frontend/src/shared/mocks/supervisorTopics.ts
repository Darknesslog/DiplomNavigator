import type { SupervisorTopic } from "../../entities/topic/supervisorTopics";
export const categories = ["Информационные системы", "Аналитика данных"];
export const directions = ["09.03.02", "09.03.03"];
export const MOCK_SUPERVISOR_TOPICS: SupervisorTopic[] = [
  {
    id: 101,
    period_id: 1,
    title: "Система рекомендаций",
    description: "Разработка системы рекомендаций.",
    requirements: "",
    category: categories[0],
    direction: directions[0],
    status: "published",
    studentIds: [],
    fileNames: [],
  },
  {
    id: 102,
    period_id: 1,
    title: "Система управления студентами",
    description: "Разработка информационной системы.",
    requirements: "",
    category: categories[0],
    direction: directions[0],
    status: "published",
    studentIds: [],
    fileNames: [],
  },
  {
    id: 103,
    period_id: 1,
    title: "Платформа мониторинга",
    description: "Мониторинг показателей системы.",
    requirements: "",
    category: categories[1],
    direction: directions[1],
    status: "archived",
    studentIds: [],
    fileNames: [],
  },
];

export const periods = [{ id: 1, label: "2025/2026" }];
