// src/widgets/Layout/Layout.tsx
import React, { useState } from 'react';
import { GraduationCap, ChartLine, Users, BookOpen, FileText, Bell, CircleHelp, Settings, PanelLeftClose, Pin } from 'lucide-react';
import './Layout.css';
import '../../pages/supervisor/SupervisorExtras.css';
import { SupervisorProfileMenu } from './SupervisorProfile';
import type { Appearance } from '../../entities/user/supervisorAccount';

interface LayoutProps {
  children: React.ReactNode;
  appearance?: Appearance;
  unreadCount?: number;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  userRole: 'student' | 'nauchruk' | 'zavkaf';
  userName: string;
  onLogout?: () => void; // <-- ДОБАВИТЬ
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  appearance, unreadCount = 0,
  activeTab,
  onTabChange,
  userRole,
  userName,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(false);
  if (userRole === 'nauchruk') {
    const items = [
      { key: 'dashboard', label: 'Главная', Icon: ChartLine, ready: true },
      { key: 'students', label: 'Мои студенты', Icon: Users, ready: true },
      { key: 'applications', label: 'Мои темы', Icon: BookOpen, ready: true },
      { key: 'reports', label: 'Отчёты', Icon: FileText, ready: true },
      { key: 'notifications', label: 'Уведомления', Icon: Bell, ready: true },
      { key: 'help', label: 'Помощь', Icon: CircleHelp, ready: true },
      { key: 'settings', label: 'Настройки', Icon: Settings, ready: true },
    ];
    return <div data-theme={appearance?.theme} data-font={appearance?.font} className={`sup-shell ${collapsed ? 'sup-collapsed' : ''}`}>
      <aside className={`sup-sidebar ${pinned ? 'sup-pinned' : ''}`}>
        <div className="sup-brand"><span className="sup-brand-icon"><GraduationCap size={23} /></span>{!collapsed && <strong>ДипломНавигатор</strong>}</div>
        <div className="sup-controls"><button title={collapsed ? 'Развернуть' : 'Свернуть'} aria-expanded={!collapsed} onClick={() => setCollapsed(v => !v)}><PanelLeftClose size={15} />{!collapsed && 'Свернуть'}</button>{!collapsed && <button aria-pressed={pinned} onClick={() => setPinned(v => !v)}><Pin size={15} />{pinned ? 'Открепить' : 'Закрепить'}</button>}</div>
        <nav>{items.map(({ key, label, Icon, ready }) => <button key={key} title={ready ? label : `${label} — в разработке`} disabled={!ready} className={activeTab === key ? 'active' : ''} onClick={() => onTabChange?.(key)}><Icon size={23} />{!collapsed && label}{key === 'notifications' && unreadCount > 0 && <span className="sx-count">{unreadCount}</span>}</button>)}</nav>
      </aside>
      <div className="sup-main"><header className="sup-header"><strong className="sx-page-title">{items.find(i => i.key === activeTab)?.label}</strong><SupervisorProfileMenu onLogout={onLogout} /></header><main className="sup-content">{children}</main></div>
    </div>;
  }
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
            <div className="profile-avatar">{userRole === 'zavkaf' ? 'ЕП' : 'АИ'}</div>
            <div className="profile-info">
              <span className="profile-name">{userName}</span>
              <span className="profile-role">{userRole === 'zavkaf' ? 'Заведующий кафедрой' : 'Студент'}</span>
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
