// src/pages/settings/SettingsPage.tsx
import React, { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../../shared/api/user';
import type { CurrentUser } from '../../shared/mocks/user';
import './SettingsPage.css';

interface SettingsPageProps {
  onLogout: () => void;
  userRole: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout, userRole }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetchCurrentUser(userRole).then(setUser);
  }, [userRole]);

  if (!user) {
    return <div>Загрузка...</div>;
  }

  const roleLabel = user.role === 'student' ? 'Студент'
    : user.role === 'nauchruk' ? 'Научный руководитель'
    : user.role === 'zavkaf' ? 'Заведующий кафедрой'
    : 'Администратор';

  return (
    <div className="settings-container">
      <div className="settings-sidebar">
        <button className="settings-nav-btn active">Профиль</button>
        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }} />
        <button className="settings-nav-btn" onClick={onLogout} style={{ color: '#EF4444' }}>
          Выйти
        </button>
      </div>

      <div className="settings-content">
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '20px' }}>Личные данные</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Имя</label>
            <input className="form-input" value={user.first_name} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Фамилия</label>
            <input className="form-input" value={user.last_name} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Отчество</label>
            <input className="form-input" value={user.middle_name || ''} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Электронная почта</label>
            <input className="form-input" value={user.email} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Роль</label>
            <input className="form-input" value={roleLabel} disabled />
          </div>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '20px' }}>
          Изменение профиля будет доступно после интеграции с бэкендом.
        </p>
      </div>
    </div>
  );
};