// src/pages/zavkaf/ZavkaDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { fetchSupervisors } from '../../shared/api/supervisors';
import { fetchZavkaStats } from '../../shared/api/stats';
import type { SupervisorLoad } from '../../shared/mocks/supervisors';
import type { ZavkaStats } from '../../shared/mocks/stats';
import './ZavkaDashboardPage.css';

export const ZavkaDashboardPage: React.FC = () => {
  const [supervisors, setSupervisors] = useState<SupervisorLoad[]>([]);
  const [stats, setStats] = useState<ZavkaStats | null>(null);

  useEffect(() => {
    Promise.all([fetchSupervisors(), fetchZavkaStats()]).then(([sups, st]) => {
      setSupervisors(sups);
      setStats(st);
    });
  }, []);

  if (!stats || supervisors.length === 0) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="zavkaf-header">
        <h1 className="zavkaf-title">Панель управления кафедрой</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Всего студентов</span>
          <span className="stat-value">{stats.totalStudents}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Руководителей</span>
          <span className="stat-value">{stats.totalSupervisors}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">В работе</span>
          <span className="stat-value">{stats.inProgress}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Предзащита</span>
          <span className="stat-value">{stats.preDefense}</span>
        </div>
      </div>

      <div className="workload-list">
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Нагрузка руководителей</h2>
        {supervisors.map((sup) => (
          <div key={sup.id} className="workload-item">
            <div className="workload-top">
              <div>
                <div className="workload-name">{sup.name}</div>
                <div className="workload-deg">{sup.degree}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                {sup.loadCurrent} / {sup.loadMax}
              </div>
            </div>
            <div className="workload-bar-bg">
              <div className="workload-bar-fill" style={{ width: `${(sup.loadCurrent / sup.loadMax) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};