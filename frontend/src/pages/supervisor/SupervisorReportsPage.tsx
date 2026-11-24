import { useEffect, useState } from "react";
import { fetchSupervisorDashboard } from "../../shared/api/supervisorDashboard";
import type {
  SupervisorDashboard,
  DashboardStudent,
  AttentionItem,
} from "../../entities/work/supervisorDashboard";
import { DataTable, Filter, Status, statusLabels } from "./SupervisorTables";
import type { Column } from "./SupervisorTables";
import "./SupervisorDashboardPage.css";
import "./SupervisorStudentsPage.css";
import "./SupervisorManagement.css";
type Kind = "students" | "progress" | "attention";
const titles: Record<Kind, string> = {
  students: "Список студентов",
  progress: "Выполнение ВКР",
  attention: "Студенты, требующие внимания",
};
type Filters = { group: string; stage: string; status: string; reason: string };
const empty: Filters = { group: "", stage: "", status: "", reason: "" };
const unique = (v: string[]) => [...new Set(v)];
export function SupervisorReportsPage({
  onOpenStudent,
  refreshKey = true,
}: {
  onOpenStudent: (id: number) => void;
  refreshKey?: boolean;
}) {
  const [data, setData] = useState<SupervisorDashboard | null>(null);
  const [error, setError] = useState("");
  const [report, setReport] = useState<{
    kind: Kind;
    filters: Filters;
    date: string;
  } | null>(null);
  useEffect(() => {
    let active = true;
    fetchSupervisorDashboard()
      .then((v) => {
        if (active) {
          setData(v);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("Не удалось загрузить отчёты");
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);
  if (!data) return <p>{error || "Загрузка…"}</p>;
  return (
    <div className="sd sm">
      {report ? (
        <>
          <button className="sd-link ss-back" onClick={() => setReport(null)}>
            ← Назад к отчётам
          </button>
          <h1>{titles[report.kind]}</h1>
          <ReportSection
            key={report.kind}
            kind={report.kind}
            data={data}
            onOpenStudent={onOpenStudent}
            report={report}
            onReset={() => setReport({ ...report, filters: empty })}
          />
        </>
      ) : (
        <>
          <h1>Отчёты</h1>
          {(Object.keys(titles) as Kind[]).map((kind) => (
            <ReportSection
              key={kind}
              kind={kind}
              data={data}
              onOpenStudent={onOpenStudent}
              onGenerate={(filters) =>
                setReport({
                  kind,
                  filters,
                  date: new Date().toLocaleDateString("ru-RU"),
                })
              }
            />
          ))}
        </>
      )}
    </div>
  );
}
function ReportSection({
  kind,
  data,
  onOpenStudent,
  onGenerate,
  report,
  onReset,
}: {
  kind: Kind;
  data: SupervisorDashboard;
  onOpenStudent: (id: number) => void;
  onGenerate?: (f: Filters) => void;
  report?: { filters: Filters; date: string };
  onReset?: () => void;
}) {
  const [local, setLocal] = useState<Filters>(empty);
  const f = report?.filters ?? local;
  const set = (k: keyof Filters, v: string) =>
    setLocal((p) => ({ ...p, [k]: v }));
  const students = data.students.filter(
    (s) =>
      (!f.group || s.group === f.group) &&
      (!f.stage || s.stage === f.stage) &&
      (!f.status || statusLabels[s.status] === f.status),
  );
  const attention = data.attention.flatMap((a) => {
    const student = students.find((s) => s.id === a.studentId);
    return student && (!f.reason || a.reason === f.reason)
      ? [{ ...a, student }]
      : [];
  });
  const name: Column<DashboardStudent> = {
    label: "Студент",
    value: (s) => s.name,
    render: (s) => (
      <button className="sd-link" onClick={() => onOpenStudent(s.id)}>
        {s.name}
      </button>
    ),
  };
  const cols: Column<DashboardStudent>[] = [
    name,
    { label: "Группа", value: (s) => s.group },
    ...(kind === "students"
      ? [{ label: "Тема ВКР", value: (s: DashboardStudent) => s.topic }]
      : []),
    { label: "Текущий этап", value: (s) => s.stage },
    ...(kind === "progress"
      ? [
          {
            label: "Выполнение",
            value: (s: DashboardStudent) => s.progress,
            render: (s: DashboardStudent) => (
              <div className="sm-progress">
                <strong>{s.progress}%</strong>
                <progress className={s.status} max={100} value={s.progress} />
              </div>
            ),
          },
        ]
      : []),
    {
      label: "Статус",
      value: (s) => statusLabels[s.status],
      render: (s) => <Status status={s.status} />,
    },
  ];
  type Row = AttentionItem & { student: DashboardStudent };
  const acols: Column<Row>[] = [
    {
      label: "Студент",
      value: (a) => a.student.name,
      render: (a) => name.render?.(a.student),
    },
    { label: "Группа", value: (a) => a.student.group },
    {
      label: "Причина внимания",
      value: (a) => a.reason,
      render: (a) => (
        <span className={`sd-pill ${a.priority === 1 ? "red" : "yellow"}`}>
          {a.reason}
        </span>
      ),
    },
    {
      label: "Дата последнего события",
      value: (a) => a.date,
      render: (a) => new Date(a.date + "T00:00:00").toLocaleDateString("ru-RU"),
    },
  ];
  const table =
    kind === "attention" ? (
      <DataTable
        key={JSON.stringify(f)}
        rows={attention}
        columns={acols}
        rowKey={(a) => `${a.studentId}-${a.reason}`}
        initialSort={3}
        descending
      />
    ) : (
      <DataTable
        key={JSON.stringify(f)}
        rows={students}
        columns={cols}
        rowKey={(s) => s.id}
        initialSort={kind === "progress" ? 3 : 0}
        descending={kind === "progress"}
      />
    );
  if (report) {
    const subset =
      kind === "attention"
        ? students.filter((s) => attention.some((a) => a.studentId === s.id))
        : students;
    return (
      <>
        <section className="sd-panel sm-meta">
          {[
            ["Тип отчёта", titles[kind]],
            ["Дата формирования", report.date],
            ["Группа", f.group || "Все"],
            ...(kind === "attention"
              ? [["Причина внимания", f.reason || "Все"]]
              : [
                  ["Этап ВКР", f.stage || "Все"],
                  ["Статус", f.status || "Все"],
                ]),
          ].map(([k, v]) => (
            <div key={k}>
              <span>{k}:</span>
              <strong>{v}</strong>
            </div>
          ))}
          <button className="ss-secondary" onClick={onReset}>
            ↻ Сбросить фильтры
          </button>
        </section>
        <h2>Сводка</h2>
        <div className="sm-summary">
          {[
            ["Студентов в отчёте", subset.length],
            [
              "Среднее выполнение",
              `${subset.length ? Math.round(subset.reduce((n, s) => n + s.progress, 0) / subset.length) : 0}%`,
            ],
            ...Object.entries(statusLabels).map(([k, v]) => [
              v,
              subset.filter((s) => s.status === k).length,
            ]),
          ].map(([k, v]) => (
            <article className="sd-card" key={k}>
              {k}
              <strong>{v}</strong>
            </article>
          ))}
        </div>
        <h2>Подробные данные</h2>
        <section className="sd-panel">{table}</section>
      </>
    );
  }
  return (
    <section className="sd-panel sm-section">
      <h2>{titles[kind]}</h2>
      <div className="sm-filters">
        {kind === "attention" && (
          <Filter
            label="Причина внимания"
            value={f.reason}
            options={unique(data.attention.map((a) => a.reason))}
            onChange={(v) => set("reason", v)}
          />
        )}
        <Filter
          label="Группа"
          value={f.group}
          options={unique(data.students.map((s) => s.group))}
          onChange={(v) => set("group", v)}
        />
        {kind !== "attention" && (
          <>
            <Filter
              label="Этап ВКР"
              value={f.stage}
              options={unique(data.students.map((s) => s.stage))}
              onChange={(v) => set("stage", v)}
            />
            <Filter
              label="Статус"
              value={f.status}
              options={Object.values(statusLabels)}
              onChange={(v) => set("status", v)}
            />
          </>
        )}
        <button className="ss-secondary" onClick={() => setLocal(empty)}>
          ↻ Сбросить фильтры
        </button>
        <button className="ss-primary" onClick={() => onGenerate?.(f)}>
          Сформировать отчёт
        </button>
      </div>
      {table}
    </section>
  );
}
