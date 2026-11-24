import { Users, Clock, FileCheck, CheckCircle } from "lucide-react";
import type {
  SupervisorDashboard,
  WorkStatus,
} from "../../entities/work/supervisorDashboard";
const labels: Record<WorkStatus, string> = {
  in_progress: "В работе",
  review: "На проверке",
  completed: "Завершено",
};
export function SupervisorStats({ data }: { data: SupervisorDashboard }) {
  const cards = [
    {
      label: "Всего студентов",
      value: data.students.length,
      Icon: Users,
      color: "blue",
    },
    ...(
      [
        { status: "in_progress", Icon: Clock, color: "blue" },
        { status: "review", Icon: FileCheck, color: "yellow" },
        { status: "completed", Icon: CheckCircle, color: "green" },
      ] as const
    ).map((item) => ({
      ...item,
      label: labels[item.status],
      value: data.students.filter((s) => s.status === item.status).length,
    })),
  ];
  return (
    <div className="sd-stats">
      {cards.map(({ label, value, Icon, color }) => (
        <article className="sd-card" key={label}>
          <span className={`sd-icon ${color}`}>
            <Icon size={30} />
          </span>
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </div>
  );
}
