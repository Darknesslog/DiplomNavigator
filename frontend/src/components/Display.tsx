import type { Topic } from '../demo/data'

export function StatCard({ label, value, detail, change, icon, accent = '' }: {
  label: string; value: string | number; detail: string; change?: string; icon: string; accent?: string
}) {
  return (
    <div className="stat-card">
      <div className="stat-top"><span className="stat-label">{label}</span><span className={`stat-icon ${accent}`}>{icon}</span></div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
      {change && <div className={`stat-change ${accent}`}>{change}</div>}
    </div>
  )
}

export function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return <div className="legend-item"><span className={`legend-dot ${color}`} /><span className="legend-label">{label}</span><strong>{value}</strong></div>
}

export function WorkloadRow({ name, initials, students, hours, color }: {
  name: string; initials: string; students: number; hours: number; color: string
}) {
  return (
    <div className="workload-row">
      <div className={`avatar workload-avatar ${color}`}>{initials}</div>
      <div className="workload-person"><strong>{name}</strong><span>{students} студентов</span></div>
      <div className="workload-meter"><div className="workload-track"><span className={color} style={{ width: `${Math.min(hours, 120) / 120 * 100}%` }} /></div><span className={hours > 100 ? 'over-limit' : ''}>{hours}%</span></div>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const className = status === 'В работе' ? 'in-progress' : status === 'На согласовании' ? 'pending' : 'not-started'
  return <span className={`status-badge ${className}`}>{status}</span>
}

export function TopicStatusBadge({ status }: { status: Topic['status'] }) {
  const className = status === 'Открыта' ? 'topic-open' : status === 'Частично занята' ? 'topic-partial' : 'topic-full'
  return <span className={`topic-status ${className}`}><span />{status}</span>
}
