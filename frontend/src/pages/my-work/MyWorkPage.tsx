// src/pages/my-work/MyWorkPage.tsx
import React, { useEffect, useState } from 'react';
import { fetchMyWork } from '../../shared/api/work';
import type { Work } from '../../entities/work/types';
import './MyWorkPage.css';

export const MyWorkPage: React.FC = () => {
  const [work, setWork] = useState<Work | null>(null);

  useEffect(() => {
    fetchMyWork().then(setWork);
  }, []);

  if (!work) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="work-header">
        <h1 className="work-title">Моя выпускная работа</h1>
        <p className="work-subtitle">Тема, этапы, файлы и связь с руководителем.</p>
      </div>

      <div className="work-grid">
        <div className="work-card">
          <div className="work-card-header">
            <div>
              <span className="topic-tag">НА ПРОВЕРКЕ</span>
              <h2 className="work-topic-title">{work.title}</h2>
              <p className="work-topic-desc">
                Исследование различных моделей регрессии и классификации на основе данных о посещаемости и успеваемости.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="supervisor-card">
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Научный руководитель</h3>
            <div>
              <div className="supervisor-name">{work.supervisor_name}</div>
              <div className="supervisor-info">Профессор, д.т.н.</div>
            </div>
          </div>

          <div className="supervisor-card">
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>Прогресс</h3>
            <div className="progress-block">
              <div className="progress-header">
                <span>{work.progress_percent}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${work.progress_percent}%` }} />
              </div>
            </div>
            <p className="supervisor-info">Демонстрационное значение.</p>
          </div>
        </div>
      </div>
    </div>
  );
};