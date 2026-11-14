// src/pages/zavkaf/ZavkaSupervisorsPage.tsx
import React, { useEffect, useState } from 'react';
import { fetchSupervisors } from '../../shared/api/supervisors';
import type { SupervisorLoad } from '../../shared/mocks/supervisors';
import './ZavkaSupervisorsPage.css';

export const ZavkaSupervisorsPage: React.FC = () => {
  const [supervisors, setSupervisors] = useState<SupervisorLoad[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchSupervisors().then(setSupervisors);
  }, []);

  const toggle = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (supervisors.length === 0) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="zavkaf-header">
        <h1 className="zavkaf-title">Руководители и студенты</h1>
      </div>

      {supervisors.map((sup) => (
        <div key={sup.id} className="accordion-item">
          <div className="accordion-header" onClick={() => toggle(sup.id)}>
            <div>
              <div className="workload-name">{sup.name}</div>
              <div className="workload-deg">{sup.degree}</div>
            </div>
            <span style={{ fontSize: '20px', color: '#64748B' }}>
              {expandedId === sup.id ? '▲' : '▼'}
            </span>
          </div>
          {expandedId === sup.id && (
            <div className="accordion-body">
              {sup.students.map((st) => (
                <div key={st.id} className="student-row-simple">
                  <div style={{ fontWeight: 600, color: 'var(--color-brand-blue)' }}>{st.name}</div>
                  <div style={{ color: '#64748B' }}>{st.group}</div>
                  <div>{st.topic}</div>
                  <div style={{ textAlign: 'right', fontWeight: 600 }}>{st.progress}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};