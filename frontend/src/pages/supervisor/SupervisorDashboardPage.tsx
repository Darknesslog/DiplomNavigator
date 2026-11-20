// src/pages/supervisor/SupervisorDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { fetchSupervisors } from '../../shared/api/supervisors';
import { fetchSupervisorStats } from '../../shared/api/stats';
import type { SupervisorLoad } from '../../shared/mocks/supervisors';
import type { SupervisorStats } from '../../shared/mocks/stats';
import './SupervisorDashboardPage.css';

export const SupervisorDashboardPage: React.FC = () => {
  const [supervisor, setSupervisor] = useState<SupervisorLoad | null>(null);
  const [stats, setStats] = useState<SupervisorStats | null>(null);

  useEffect(() => {
    Promise.all([fetchSupervisors(), fetchSupervisorStats()]).then(([sups, st]) => {
      setSupervisor(sups[0]);
      setStats(st);
    });
  }, []);

  if (!supervisor || !stats) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="supervisor-header">
        <h1 className="supervisor-title">Личный кабинет руководителя</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Мои студенты</span>
          <span className="stat-value">{supervisor.loadCurrent}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Свободных тем</span>
          <span className="stat-value">{supervisor.loadMax - supervisor.loadCurrent}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Новых заявок</span>
          <span className="stat-value" style={{ color: '#4D6F91' }}>{stats.pendingApplications}</span>
        </div>
        <div className="stat-card" style={{ backgroundColor: '#FBEFEC', borderColor: '#F5C6C1' }}>
          <span className="stat-label" style={{ color: '#9B3F39' }}>Требуют внимания</span>
          <span className="stat-value" style={{ color: '#9B3F39' }}>{stats.attentionRequired}</span>
        </div>
      </div>

      <div className="student-list">
        {supervisor.students.map((student) => (
          <div key={student.id} className="student-row">
            <div>
              <div className="student-name">{student.name}</div>
              <div className="student-topic">{student.topic}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span className="progress-pill">{student.stage}</span>
              <span style={{ fontWeight: 700, color: 'var(--color-brand-blue)' }}>{student.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};