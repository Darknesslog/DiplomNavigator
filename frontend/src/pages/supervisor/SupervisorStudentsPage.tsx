import { SupervisorSearch } from "./SupervisorSearch";
import { SupervisorStats } from "./SupervisorStats";
import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, X } from "lucide-react";
import {
  fetchSupervisorDashboard,
  updateStudentStage,
} from "../../shared/api/supervisorDashboard";
import type {
  SupervisorDashboard,
  DashboardStudent,
  WorkStatus,
} from "../../entities/work/supervisorDashboard";
import "./SupervisorDashboardPage.css";
import "./SupervisorStudentsPage.css";
const labels: Record<WorkStatus, string> = {
  in_progress: "В работе",
  review: "На проверке",
  completed: "Завершено",
};
const date = (v: string) =>
  new Date(v + "T00:00:00").toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
function Status({ status }: { status: WorkStatus }) {
  return (
    <span
      className={`sd-pill ${status === "review" ? "yellow" : status === "completed" ? "green" : "blue"}`}
    >
      {labels[status]}
    </span>
  );
}
export function SupervisorStudentsPage({
  studentId,
  onSelect,
  refreshKey = true,
}: {
  studentId: number | null;
  onSelect: (id: number | null) => void;
  refreshKey?: boolean;
}) {
  const [data, setData] = useState<SupervisorDashboard | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{
    key: "name" | "group" | "stage" | "status";
    asc: boolean;
  }>({ key: "name", asc: true });
  useEffect(() => {
    let active = true;
    fetchSupervisorDashboard()
      .then((d) => {
        if (active) {
          setData(d);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("Не удалось загрузить студентов");
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);
  if (!data) return <p>{error || "Загрузка…"}</p>;
  if (studentId !== null) {
    const student = data.students.find((s) => s.id === studentId);
    return student ? (
      <Profile
        key={student.id}
        student={student}
        stages={data.stages.map((s) => s.label)}
        onBack={() => onSelect(null)}
        onSaved={setData}
      />
    ) : (
      <div>
        <p>Студент не найден</p>
        <button onClick={() => onSelect(null)}>Назад</button>
      </div>
    );
  }
  const stages = data.stages.map((s) => s.label);
  const students = data.students;
  const filtered = students
    .filter(
      (s) =>
        s.name.toLowerCase().includes(search.trim().toLowerCase()) &&
        (!group || s.group === group) &&
        (!stage || s.stage === stage) &&
        (!status || s.status === status),
    )
    .sort(
      (a, b) =>
        a[sort.key].localeCompare(b[sort.key], "ru") * (sort.asc ? 1 : -1),
    );
  const size = 5,
    pages = Math.max(1, Math.ceil(filtered.length / size)),
    current = Math.min(page, pages);
  const filter = (setter: (v: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };
  return (
    <div className="sd ss">
      <h1>Мои студенты</h1>
      <SupervisorStats data={data} />
      <section className="sd-panel ss-list">
        <div className="ss-filters">
          <label>
            Поиск
            <SupervisorSearch
              placeholder="ФИО студента"
              value={search}
              onChange={(v) => filter(setSearch, v)}
            />
          </label>
          <label>
            Группа
            <select
              value={group}
              onChange={(e) => filter(setGroup, e.target.value)}
            >
              <option value="">Все</option>
              {[...new Set(students.map((s) => s.group))].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <label>
            Этап ВКР
            <select
              value={stage}
              onChange={(e) => filter(setStage, e.target.value)}
            >
              <option value="">Все</option>
              {stages.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Статус студента
            <select
              value={status}
              onChange={(e) => filter(setStatus, e.target.value)}
            >
              <option value="">Все</option>
              {Object.entries(labels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button
            className="ss-secondary"
            onClick={() => {
              setSearch("");
              setGroup("");
              setStage("");
              setStatus("");
              setPage(1);
            }}
          >
            Сбросить фильтры
          </button>
        </div>
        <div className="sd-table-wrap">
          <table>
            <thead>
              <tr>
                {(
                  [
                    "name",
                    "group",
                    "topic",
                    "stage",
                    "status",
                    "actions",
                  ] as const
                ).map((k, i) => (
                  <th key={k}>
                    {k === "topic" || k === "actions" ? (
                      [
                        "Студент",
                        "Группа",
                        "Тема ВКР",
                        "Текущий этап",
                        "Статус",
                        "Действия",
                      ][i]
                    ) : (
                      <button
                        onClick={() =>
                          setSort((s) => ({
                            key: k,
                            asc: s.key === k ? !s.asc : true,
                          }))
                        }
                      >
                        {
                          [
                            "Студент",
                            "Группа",
                            "Тема ВКР",
                            "Текущий этап",
                            "Статус",
                            "Действия",
                          ][i]
                        }{" "}
                        {sort.key === k ? (sort.asc ? "↑" : "↓") : "↕"}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((current - 1) * size, current * size).map((s) => (
                <tr key={s.id}>
                  <td>
                    <button className="sd-link" onClick={() => onSelect(s.id)}>
                      {s.name}
                    </button>
                  </td>
                  <td>{s.group}</td>
                  <td>{s.topic}</td>
                  <td>{s.stage}</td>
                  <td>
                    <Status status={s.status} />
                  </td>
                  <td>
                    <button className="sd-link" onClick={() => onSelect(s.id)}>
                      Подробнее
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6}>Студенты не найдены</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="sd-footer">
          <span>
            Показано {filtered.length ? (current - 1) * size + 1 : 0}–
            {Math.min(current * size, filtered.length)} из {filtered.length}
          </span>
          <div>
            <button
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              ‹
            </button>{" "}
            {current}{" "}
            <button
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              ›
            </button>{" "}
            Страница {current} из {pages}
          </div>
        </footer>
      </section>
    </div>
  );
}
function Profile({
  student: s,
  stages,
  onBack,
  onSaved,
}: {
  student: DashboardStudent;
  stages: string[];
  onBack: () => void;
  onSaved: (d: SupervisorDashboard) => void;
}) {
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState(s.stage);
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, busy]);
  async function save() {
    setBusy(true);
    setError("");
    try {
      const d = await updateStudentStage(s.assignmentId, {
        stage: next,
        comment: comment.trim() || undefined,
        file: file ?? undefined,
      });
      onSaved(d);
      setOpen(false);
    } catch {
      setError("Не удалось сохранить изменения");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="sd ss">
      <button className="sd-link ss-back" onClick={onBack}>
        <ArrowLeft size={18} /> Назад
      </button>
      <div className="ss-title">
        <h1>{s.name}</h1>
        <Status status={s.status} />
      </div>
      <section className="sd-panel ss-profile">
        <div className="ss-profile-grid">
          <div>
            <label>Группа</label>
            <p>{s.group}</p>
            <label>Тема ВКР</label>
            <p>{s.topic}</p>
            <label>Дата назначения этапа</label>
            <p>{s.history[0] ? date(s.history[0].date) : "Не назначена"}</p>
            <label>Статус студента</label>
            <Status status={s.status} />
          </div>
          <div>
            <div className="ss-stage">
              Текущий этап<strong>{s.stage}</strong>
            </div>
            <label>Дата защиты</label>
            <p>{s.defenseDate ? date(s.defenseDate) : "Не назначена"}</p>
          </div>
          <div>
            <button
              className="ss-primary"
              disabled={s.status === "completed"}
              onClick={() => {
                setNext(stages[stages.indexOf(s.stage) + 1] || s.stage);
                setFile(null);
                setComment("");
                setError("");
                setOpen(true);
              }}
            >
              <Pencil size={17} /> Изменить этап ВКР
            </button>
          </div>
        </div>
        <div className="ss-progress">
          Выполнение ВКР <strong>{s.progress}%</strong>
          <progress value={s.progress} max={100} />
        </div>
      </section>
      <h2>История этапов</h2>
      <ol className="ss-history">
        {s.history.map((h, i) => (
          <li key={`${h.date}-${i}`}>
            <strong>
              {h.stage} — назначена {date(h.date)}
            </strong>
            {i === 0 && <small>Текущий активный этап</small>}
            {h.comment && <p>{h.comment}</p>}
            {h.fileName && <small>Файл: {h.fileName}</small>}
          </li>
        ))}
      </ol>
      {open && (
        <div className="ss-overlay" onClick={() => !busy && setOpen(false)}>
          <form
            className="ss-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Изменить этап ВКР"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <header>
              <h2>Изменить этап ВКР</h2>
              <button
                type="button"
                aria-label="Закрыть"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            </header>
            <div className="ss-drawer-body">
              <strong>{s.name}</strong>
              <p className="sd-muted">Группа {s.group}</p>
              <label>Текущий этап</label>
              <div className="ss-stage">{s.stage}</div>
              <label>
                Новый этап
                <select
                  autoFocus
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                >
                  {stages
                    .filter((_, i) => i > stages.indexOf(s.stage))
                    .map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                </select>
              </label>
              <label>Файл к этапу</label>
              <small>Прикрепление файла не меняет статус этапа</small>
              <div
                className="ss-drop"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setFile(e.dataTransfer.files[0] ?? null);
                }}
              >
                {file
                  ? file.name
                  : "Перетащите файл сюда или выберите на устройстве"}
              </div>
              <input
                type="file"
                aria-label="Прикрепить файл"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <button
                  type="button"
                  className="sd-link"
                  onClick={() => setFile(null)}
                >
                  Удалить файл
                </button>
              )}
              <label>
                Комментарий (необязательно)
                <textarea
                  maxLength={2000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Добавьте комментарий к смене этапа"
                />
              </label>
              {error && <p role="alert">{error}</p>}
            </div>
            <footer>
              <button
                type="button"
                className="ss-secondary"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Отмена
              </button>
              <button
                className="ss-primary"
                disabled={busy || next === s.stage}
              >
                Сохранить изменения
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}
