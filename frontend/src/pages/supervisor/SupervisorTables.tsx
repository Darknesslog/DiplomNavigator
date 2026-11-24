import { useState } from "react";
import type { ReactNode } from "react";
import type { WorkStatus } from "../../entities/work/supervisorDashboard";
export const statusLabels: Record<WorkStatus, string> = {
  in_progress: "В работе",
  review: "На проверке",
  completed: "Завершено",
};
export function Status({ status }: { status: WorkStatus }) {
  return (
    <span
      className={`sd-pill ${status === "completed" ? "green" : status === "review" ? "yellow" : "blue"}`}
    >
      {statusLabels[status]}
    </span>
  );
}
export function Filter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Все</option>
        {options.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </label>
  );
}
export interface Column<T> {
  label: string;
  value: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  initialSort = 0,
  descending = false,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  initialSort?: number;
  descending?: boolean;
}) {
  const [sort, setSort] = useState({ index: initialSort, desc: descending });
  const [page, setPage] = useState(1);
  const sorted = [...rows].sort((a, b) => {
    const x = columns[sort.index].value(a),
      y = columns[sort.index].value(b);
    return (
      (typeof x === "number" && typeof y === "number"
        ? x - y
        : String(x).localeCompare(String(y), "ru")) * (sort.desc ? -1 : 1)
    );
  });
  const pages = Math.max(1, Math.ceil(rows.length / 5)),
    current = Math.min(page, pages);
  return (
    <>
      <div className="sd-table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={c.label}>
                  {c.sortable === false ? (
                    c.label
                  ) : (
                    <button
                      onClick={() => {
                        setSort((s) => ({
                          index: i,
                          desc: s.index === i ? !s.desc : false,
                        }));
                        setPage(1);
                      }}
                    >
                      {c.label}{" "}
                      {sort.index === i ? (sort.desc ? "↓" : "↑") : "↕"}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.slice((current - 1) * 5, current * 5).map((r) => (
              <tr key={rowKey(r)}>
                {columns.map((c) => (
                  <td key={c.label}>{c.render ? c.render(r) : c.value(r)}</td>
                ))}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={columns.length}>Нет данных</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="sd-footer">
        <span>
          Показано {rows.length ? (current - 1) * 5 + 1 : 0}–
          {Math.min(current * 5, rows.length)} из {rows.length}
        </span>
        <div>
          <button disabled={current === 1} onClick={() => setPage(current - 1)}>
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
    </>
  );
}
