import { SupervisorStats } from "./SupervisorStats";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { fetchSupervisorDashboard } from "../../shared/api/supervisorDashboard";
import type {
  SupervisorDashboard,
  WorkStatus,
} from "../../entities/work/supervisorDashboard";
import "./SupervisorDashboardPage.css";
const labels: Record<WorkStatus, string> = {
  in_progress: "В работе",
  review: "На проверке",
  completed: "Завершено",
};
const formatDate = (date: string) =>
  new Date(date + "T00:00:00").toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const initials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
export function SupervisorDashboardPage({
  onOpenStudent,
  refreshKey = true,
}: {
  onOpenStudent: (id: number) => void;
  refreshKey?: boolean;
}) {
  const [data, setData] = useState<SupervisorDashboard | null>(null);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState("priority");
  const [requestedPage, setPage] = useState(1);
  const [eventSort, setEventSort] = useState<{
    key: "date" | "description" | "student" | "status";
    asc: boolean;
  }>({ key: "date", asc: false });
  useEffect(() => {
    let active = true;
    fetchSupervisorDashboard()
      .then((value) => {
        if (active) {
          setData(value);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);
  if (error) return <p role="alert">Не удалось загрузить данные.</p>;
  if (!data) return <p>Загрузка…</p>;
  const student = (id: number) => data.students.find((item) => item.id === id);
  const attention = [...data.attention].sort((a, b) =>
    sort === "priority"
      ? a.priority - b.priority
      : b.date.localeCompare(a.date),
  );
  const pages = Math.max(1, Math.ceil(attention.length / 4));
  const page = Math.min(requestedPage, pages);
  const events = [...data.events].sort((a, b) => {
    const value = (e: typeof a) =>
      eventSort.key === "student"
        ? (student(e.studentId)?.name ?? "")
        : e[eventSort.key];
    return value(a).localeCompare(value(b), "ru") * (eventSort.asc ? 1 : -1);
  });
  const changeSort = (key: typeof eventSort.key) =>
    setEventSort((old) => ({ key, asc: old.key === key ? !old.asc : true }));
  return (
    <div className="sd">
      <h1>Главная</h1>
      <SupervisorStats data={data} />
      <div className="sd-heading">
        <h2>Студенты, требующие внимания</h2>
        <select
          aria-label="Сортировка студентов"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="priority">Сортировка: по приоритету</option>
          <option value="date">Сортировка: по дате</option>
        </select>
      </div>
      <div className="sd-panel">
        {attention.length === 0 && (
          <p className="sd-empty">Нет студентов, требующих внимания</p>
        )}
        {attention.slice((page - 1) * 4, page * 4).map((item) => {
          const person = student(item.studentId);
          if (!person) return null;
          return (
            <div className="sd-attention" key={item.studentId}>
              <div className="sd-person">
                <span className="sd-avatar">{initials(person.name)}</span>
                <div>
                  <button
                    className="sd-link"
                    onClick={() => onOpenStudent(person.id)}
                  >
                    {person.name}
                  </button>
                  <div className="sd-muted">{person.group}</div>
                </div>
              </div>
              <span
                className={`sd-pill ${item.priority === 1 ? "red" : "yellow"}`}
              >
                {item.reason}
              </span>
              <span className="sd-muted">{item.description}</span>
              <span>
                Последнее событие:
                <br />
                {formatDate(item.date)}
              </span>
              <button
                className="sd-link sd-open"
                onClick={() => onOpenStudent(person.id)}
              >
                Открыть профиль <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
        <footer className="sd-footer">
          <span>
            Показано {attention.length ? (page - 1) * 4 + 1 : 0}–
            {Math.min(page * 4, attention.length)} из {attention.length}
          </span>
          <div>
            Страница {page} из {pages}{" "}
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              ‹
            </button>
            <button disabled={page === pages} onClick={() => setPage(page + 1)}>
              ›
            </button>
          </div>
        </footer>
      </div>
      <h2>Последние события</h2>
      <div className="sd-panel sd-table-wrap">
        <table>
          <thead>
            <tr>
              {(
                [
                  { key: "date", label: "Дата" },
                  { key: "description", label: "Событие" },
                  { key: "student", label: "Студент" },
                  { key: "status", label: "Статус" },
                ] as const
              ).map(({ key, label }) => (
                <th
                  key={key}
                  aria-sort={
                    eventSort.key === key
                      ? eventSort.asc
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button onClick={() => changeSort(key)}>
                    {label}{" "}
                    {eventSort.key === key ? (eventSort.asc ? "↑" : "↓") : "↕"}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{formatDate(event.date)}</td>
                <td>{event.description}</td>
                <td>
                  <button
                    className="sd-link"
                    onClick={() => onOpenStudent(event.studentId)}
                  >
                    {student(event.studentId)?.name}
                  </button>
                </td>
                <td>
                  <span
                    className={`sd-pill ${event.status === "review" ? "yellow" : event.status === "completed" ? "green" : "blue"}`}
                  >
                    {labels[event.status]}
                  </span>
                </td>
              </tr>
            ))}
            {!events.length && (
              <tr>
                <td colSpan={4}>Нет событий</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
