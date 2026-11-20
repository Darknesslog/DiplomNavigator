// src/widgets/Layout/Layout.tsx
import React from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  userRole: 'student' | 'nauchruk' | 'zavkaf';
  userName: string;
  onLogout?: () => void; // <-- ДОБАВИТЬ
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  userRole,
  userName,
  onLogout,
}) => {
  return (
    <div className="layout-shell">
      <header className="layout-header">
        <div className="layout-brand">
          <div className="brand-logo">Д</div>
          <span className="brand-title">ДипломНавигатор</span>
        </div>

        {onTabChange && (
          <nav className="layout-nav">
            {userRole === 'student' && (
              <>
                <button className={`nav-btn ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => onTabChange('catalog')}>Каталог тем</button>
                <button className={`nav-btn ${activeTab === 'my-work' ? 'active' : ''}`} onClick={() => onTabChange('my-work')}>Моя работа</button>
              </>
            )}
            {userRole === 'nauchruk' && (
              <>
                <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => onTabChange('dashboard')}>Главная</button>
                <button className={`nav-btn ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => onTabChange('applications')}>Заявки</button>
              </>
            )}
            {userRole === 'zavkaf' && (
              <>
                <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => onTabChange('dashboard')}>Главная</button>
                <button className={`nav-btn ${activeTab === 'supervisors' ? 'active' : ''}`} onClick={() => onTabChange('supervisors')}>Руководители</button>
                <button className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => onTabChange('reports')}>Отчёты</button>
              </>
            )}
          </nav>
        )}

        <div className="layout-actions">
          <button className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button
            className="nav-btn"
            onClick={() => onTabChange?.('settings')}
            style={{ marginRight: '16px' }}
          >
            Настройки
          </button>
          <div className="layout-profile">
            <div className="profile-avatar">{userRole === 'zavkaf' ? 'ЕП' : userRole === 'nauchruk' ? 'АМ' : 'АИ'}</div>
            <div className="profile-info">
              <span className="profile-name">{userName}</span>
              <span className="profile-role">{userRole === 'zavkaf' ? 'Заведующий кафедрой' : userRole === 'nauchruk' ? 'Научный руководитель' : 'Студент'}</span>
            </div>
          </div>
          <button
            className="nav-btn"
            onClick={onLogout}
            style={{ color: '#EF4444' }}
          >
            Выйти
          </button>
        </div>
      </header>

      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};