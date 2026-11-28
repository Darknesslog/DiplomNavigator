import { SupervisorSearch } from "./SupervisorSearch";
import { useEffect, useState } from "react";
import {
  fetchSupervisorTopics,
  createSupervisorTopic,
  fetchTopicDirectories,
} from "../../shared/api/supervisorTopics";
import { fetchSupervisorDashboard } from "../../shared/api/supervisorDashboard";
import type {
  SupervisorTopic,
  CreateSupervisorTopic,
  TopicDirectories,
} from "../../entities/topic/supervisorTopics";
import type { DashboardStudent } from "../../entities/work/supervisorDashboard";
import { DataTable, Filter, Status } from "./SupervisorTables";
import { statusLabels } from "./supervisorStatus";
import type { Column } from "./SupervisorTables";
import "./SupervisorDashboardPage.css";
import "./SupervisorStudentsPage.css";
import "./SupervisorManagement.css";
const availability = (t: SupervisorTopic) =>
  t.status === "draft"
    ? "Черновик"
    : t.status === "published" && !t.studentIds.length
      ? "Свободна"
      : t.status === "published"
        ? "Занята"
        : "Недоступна";
function Availability({ topic }: { topic: SupervisorTopic }) {
  return (
    <span
      className={`sd-pill ${availability(topic) === "Свободна" ? "green" : "yellow"}`}
    >
      {availability(topic)}
    </span>
  );
}
export function SupervisorTopicsPage({
  initialTopicId = null,
  onOpenStudent,
  refreshKey = true,
}: {
  initialTopicId?: number | null;
  onOpenStudent: (id: number) => void;
  refreshKey?: boolean;
}) {
  const [directories, setDirectories] = useState<TopicDirectories | null>(null);
  const [topics, setTopics] = useState<SupervisorTopic[] | null>(null);
  const [students, setStudents] = useState<DashboardStudent[]>([]);
  const [error, setError] = useState("");
  const [view, setView] = useState<number | "create" | null>(initialTopicId);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [direction, setDirection] = useState("");
  const [available, setAvailable] = useState("");
  const [order, setOrder] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([
      fetchSupervisorTopics(),
      fetchSupervisorDashboard(),
      fetchTopicDirectories(),
    ])
      .then(([t, d, dirs]) => {
        if (active) {
          setDirectories(dirs);
          setTopics(t);
          setStudents(d.students);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("Не удалось загрузить темы");
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);
  if (!topics || !directories) return <p>{error || "Загрузка…"}</p>;
  const { categories, directions } = directories;
  if (view === "create")
    return (
      <TopicForm
        directories={directories}
        onCancel={() => setView(null)}
        onCreated={(t) => {
          setTopics((p) => [...(p ?? []), t]);
          setSearch("");
          setCategory("");
          setDirection("");
          setAvailable("");
          setView(t.id);
        }}
      />
    );
  const back = (
    <button className="sd-link ss-back" onClick={() => setView(null)}>
      ← Назад к моим темам
    </button>
  );
  if (view !== null) {
    const t = topics.find((t) => t.id === view);
    if (!t)
      return (
        <div>
          {back}
          <p>Тема не найдена</p>
        </div>
      );
    const assigned = students.filter((s) => t.studentIds.includes(s.id));
    const cols: Column<DashboardStudent>[] = [
      {
        label: "Студент",
        value: (s) => s.name,
        render: (s) => (
          <button className="sd-link" onClick={() => onOpenStudent(s.id)}>
            {s.name}
          </button>
        ),
      },
      { label: "Группа", value: (s) => s.group },
      { label: "Текущий этап", value: (s) => s.stage },
      {
        label: "Статус",
        value: (s) => statusLabels[s.status],
        render: (s) => <Status status={s.status} />,
      },
    ];
    return (
      <div className="sd sm">
        {back}
        <h1>{t.title}</h1>
        <section className="sd-panel sm-topic-info">
          {[
            ["Категория", t.category],
            ["Направление обучения", t.direction],
            ["Доступность", <Availability topic={t} />],
            ["Количество назначенных студентов", assigned.length],
            ["Описание", t.description],
            ["Что потребуется", t.requirements || "Не указано"],
          ].map(([k, v], i) => (
            <div key={i}>
              <span>{k}</span>
              <div>{v}</div>
            </div>
          ))}
          {t.fileNames.length > 0 && (
            <div>
              <span>Файлы</span>
              {t.fileNames.map((f, i) => (
                <div key={i}>{f}</div>
              ))}
            </div>
          )}
        </section>
        <h2>Назначенные студенты</h2>
        <section className="sd-panel">
          <DataTable rows={assigned} columns={cols} rowKey={(s) => s.id} />
        </section>
      </div>
    );
  }
  const filtered = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!category || t.category === category) &&
      (!direction || t.direction === direction) &&
      (!available || availability(t) === available),
  );
  const cols: Column<SupervisorTopic>[] = [
    {
      label: "Название темы",
      value: (t) => t.title,
      render: (t) => (
        <button className="sd-link" onClick={() => setView(t.id)}>
          {t.title}
        </button>
      ),
    },
    { label: "Категория", value: (t) => t.category },
    { label: "Направление обучения", value: (t) => t.direction },
    {
      label: "Доступность",
      value: availability,
      render: (t) => <Availability topic={t} />,
    },
    { label: "Назначенные студенты", value: (t) => t.studentIds.length },
    {
      label: "Действия",
      value: () => "",
      sortable: false,
      render: (t) => (
        <button className="sd-link" onClick={() => setView(t.id)}>
          Подробнее
        </button>
      ),
    },
  ];
  return (
    <div className="sd sm">
      <div className="sm-title">
        <h1>Мои темы</h1>
        <button className="ss-primary" onClick={() => setView("create")}>
          ＋ Создать тему
        </button>
      </div>
      <section className="sd-panel">
        <div className="sm-filters">
          <label>
            Поиск
            <SupervisorSearch
              value={search}
              onChange={setSearch}
              placeholder="Название темы"
            />
          </label>
          <Filter
            label="Категория"
            value={category}
            options={categories}
            onChange={setCategory}
          />
          <Filter
            label="Направление обучения"
            value={direction}
            options={directions}
            onChange={setDirection}
          />
          <Filter
            label="Доступность"
            value={available}
            options={["Свободна", "Занята", "Недоступна", "Черновик"]}
            onChange={setAvailable}
          />
          <label>
            Сортировка
            <select value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="">Название А–Я</option>
              <option value="desc">Название Я–А</option>
            </select>
          </label>
          <button
            className="ss-secondary"
            onClick={() => {
              setSearch("");
              setCategory("");
              setDirection("");
              setAvailable("");
              setOrder("");
            }}
          >
            ↻ Сбросить фильтры
          </button>
        </div>
        <DataTable
          key={JSON.stringify([search, category, direction, available, order])}
          rows={filtered}
          columns={cols}
          rowKey={(t) => t.id}
          descending={order === "desc"}
        />
      </section>
    </div>
  );
}
function TopicForm({
  directories,
  onCancel,
  onCreated,
}: {
  directories: TopicDirectories;
  onCancel: () => void;
  onCreated: (t: SupervisorTopic) => void;
}) {
  const { categories, directions, periods } = directories;
  const [form, setForm] = useState<CreateSupervisorTopic>({
    period_id: periods[0]?.id ?? 0,
    title: "",
    description: "",
    requirements: "",
    category: "",
    direction: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (
    k: Exclude<keyof CreateSupervisorTopic, "period_id">,
    v: string,
  ) => setForm((p) => ({ ...p, [k]: v }));
  async function save() {
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.category ||
      !form.direction
    ) {
      setError("Заполните название, описание, категорию и направление");
      return;
    }
    setBusy(true);
    setError("");
    try {
      onCreated(await createSupervisorTopic(form, files));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать тему");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="sd sm sm-create">
      <button className="sd-link ss-back" onClick={onCancel}>
        ← Назад к списку тем
      </button>
      <h1>Создание новой темы</h1>
      <form
        className="sd-panel sm-form"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label>
          Учебный период
          <select
            required
            value={form.period_id}
            onChange={(e) =>
              setForm((p) => ({ ...p, period_id: Number(e.target.value) }))
            }
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Название темы
          <input
            required
            maxLength={500}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Название ВКР"
          />
        </label>
        <label>
          Описание темы
          <textarea
            required
            maxLength={2000}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Основные задачи и ожидаемые результаты"
          />
        </label>
        <label>
          Что потребуется
          <textarea
            value={form.requirements}
            onChange={(e) => set("requirements", e.target.value)}
            placeholder="Навыки, инструменты, опыт"
          />
        </label>
        <div className="sm-upload">
          <span>Файлы к теме</span>
          <input
            id="supervisor-topic-files"
            className="sm-hidden-file"
            type="file"
            multiple
            onChange={(e) => {
              setFiles((p) => [...p, ...Array.from(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="ss-drop"
            onClick={() =>
              document.getElementById("supervisor-topic-files")?.click()
            }
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setFiles((p) => [...p, ...Array.from(e.dataTransfer.files)]);
            }}
          >
            Перетащите файлы сюда или выберите на устройстве
          </button>
        </div>
        {files.map((f, i) => (
          <div className="sm-file" key={i}>
            {f.name}
            <button
              type="button"
              className="sd-link"
              onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
            >
              Удалить
            </button>
          </div>
        ))}
        <small className="sd-muted">
          Необязательно. В демо сохраняются только имена файлов.
        </small>
        <div className="sm-form-grid">
          {(["category", "direction"] as const).map((k) => (
            <label key={k}>
              {k === "category" ? "Категория" : "Направление"}
              <select
                required
                value={form[k]}
                onChange={(e) => set(k, e.target.value)}
              >
                <option value="">Выберите значение</option>
                {(k === "category" ? categories : directions).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {error && (
          <p role="alert" className="sm-error">
            {error}
          </p>
        )}
        <footer>
          <button className="ss-primary" disabled={busy}>
            Создать тему
          </button>
          <button
            type="button"
            className="ss-secondary"
            disabled={busy}
            onClick={onCancel}
          >
            Отмена
          </button>
        </footer>
      </form>
    </div>
  );
}
