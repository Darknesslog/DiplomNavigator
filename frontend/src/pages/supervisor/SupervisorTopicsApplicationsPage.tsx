// src/pages/supervisor/SupervisorTopicsApplicationsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  decideApplication,
  fetchSupervisorApplications,
} from '../../shared/api/applications';
import type { Application } from '../../entities/application/types';
import './SupervisorTopicsApplicationsPage.css';

export const SupervisorTopicsApplicationsPage: React.FC = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSupervisorApplications()
      .then(setApps)
      .finally(() => setIsLoading(false));
  }, []);

  const handleDecision = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await decideApplication(id, status === 'approved');
      setApps((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Не удалось принять решение');
    }
  };

  if (isLoading) {
    return <div>Загрузка заявок...</div>;
  }

  return (
    <div>
      <div className="supervisor-header">
        <h1 className="supervisor-title">Заявки студентов</h1>
      </div>

      <div className="applications-list">
        {apps.map((app) => (
          <div key={app.id} className="application-card">
            <div className="app-header">
              <div>
                <div className="app-student">{app.student_name}</div>
                <div className="app-group">Группа {app.student_group}</div>
              </div>
              {app.status === "pending" && (
                <span className="progress-pill">Ожидает решения</span>
              )}
              {app.status === "approved" && (
                <span
                  className="progress-pill"
                  style={{ backgroundColor: "#ECFDF5", color: "#047857" }}
                >
                  Одобрено
                </span>
              )}
              {app.status === "rejected" && (
                <span
                  className="progress-pill"
                  style={{ backgroundColor: "#FBEFEC", color: "#9B3F39" }}
                >
                  Отклонено
                </span>
              )}
            </div>

            <div className="app-topic">{app.topic_title}</div>

            {app.status === "pending" && (
              <div className="app-actions">
                <button
                  className="btn-approve"
                  onClick={() => handleDecision(app.id, "approved")}
                >
                  ✓ Одобрить
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleDecision(app.id, "rejected")}
                >
                  Отклонить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
