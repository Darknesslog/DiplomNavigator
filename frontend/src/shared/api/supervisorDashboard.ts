import { toProgressRequest } from "./supervisorContracts";
import { MOCK_SUPERVISOR_DASHBOARD } from "../mocks/supervisorDashboard";
import type {
  SupervisorDashboard,
  StageChange,
} from "../../entities/work/supervisorDashboard";
let data = structuredClone(MOCK_SUPERVISOR_DASHBOARD);
function snapshot(): SupervisorDashboard {
  return structuredClone({
    ...data,
    attention: data.attention.filter((a) =>
      data.students.some(
        (s) =>
          s.id === a.studentId && s.status !== "completed" && s.progress < 100,
      ),
    ),
  });
}
export async function fetchSupervisorDashboard(): Promise<SupervisorDashboard> {
  return snapshot();
}
export async function updateStudentStage(
  assignmentId: number,
  input: StageChange,
): Promise<SupervisorDashboard> {
  const student = data.students.find((s) => s.assignmentId === assignmentId);
  if (!student) throw new Error("Студент не найден");
  const option = data.stages.find((s) => s.label === input.stage);
  if (
    !option ||
    data.stages.findIndex((s) => s.label === student.stage) >=
      data.stages.indexOf(option)
  )
    throw new Error("Недопустимый переход");
  const request = toProgressRequest(option, input);
  if ((request.comment?.length ?? 0) > 2000)
    throw new Error("Комментарий слишком длинный");
  const progress = request.progress_percent;
  const id = student.id;
  const change = {
    stage: input.stage,
    date: new Date().toLocaleDateString("sv-SE"),
    comment: input.comment,
    fileName: input.file?.name,
  };
  const previous = student.stage;
  student.stage = change.stage;
  student.progress = progress;
  student.status =
    option.backendStage === "defended"
      ? "completed"
      : option.backendStage === "under_review"
        ? "review"
        : "in_progress";
  student.history.unshift(change);
  data.events.unshift({
    id: Math.max(0, ...data.events.map((e) => e.id)) + 1,
    studentId: id,
    date: change.date,
    description: `Этап ВКР изменён: ${previous} → ${change.stage}`,
    status: student.status,
  });
  data.attention = data.attention.filter(
    (a) =>
      a.studentId !== id ||
      (student.status !== "completed" &&
        progress < 100 &&
        a.reasonCode !== "no_progress"),
  );
  return snapshot();
}
