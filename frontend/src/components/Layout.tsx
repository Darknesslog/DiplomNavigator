import React, { useState, useRef, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showNav?: boolean;
  userRole?: 'student' | 'nauchruk' | 'zavkaf' | 'admin';
  onLogout?: () => void;
  onOpenSettings?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab = 'catalog',
  onTabChange,
  showNav = true,
  userRole = 'student',
  onLogout,
  onOpenSettings,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <header
        style={{
          height: '72px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--color-brand-blue)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-brand-blue)', letterSpacing: '-0.02em' }}>
            ДипломНавигатор
          </span>
        </div>

        {/* Center Nav Tabs */}
        {showNav && (
          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
            {/* 1. Заведующий кафедрой */}
            {userRole === 'zavkaf' && (
              <>
                {[
                  { key: 'zavkaf-dashboard', label: 'Главная' },
                  { key: 'zavkaf-supervisors', label: 'Руководители и студенты' },
                  { key: 'zavkaf-reports', label: 'Отчёты' },
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => onTabChange?.(tab.key)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'var(--color-brand-blue)' : 'var(--color-text-muted)',
                        backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                        boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </>
            )}

            {/* 2. Научный руководитель */}
            {userRole === 'nauchruk' && (
              <>
                {[
                  { key: 'supervisor-dashboard', label: 'Главная' },
                  { key: 'students', label: 'Мои студенты' },
                  { key: 'topics', label: 'Темы и заявки' },
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => onTabChange?.(tab.key)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'var(--color-brand-blue)' : 'var(--color-text-muted)',
                        backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                        boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </>
            )}

            {/* 3. Студент */}
            {userRole === 'student' && (
              <>
                <button
                  onClick={() => onTabChange?.('catalog')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: activeTab === 'catalog' ? 600 : 500,
                    color: activeTab === 'catalog' ? 'var(--color-brand-blue)' : 'var(--color-text-muted)',
                    backgroundColor: activeTab === 'catalog' ? '#FFFFFF' : 'transparent',
                    boxShadow: activeTab === 'catalog' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Каталог тем
                </button>
                <button
                  onClick={() => onTabChange?.('my-work')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: activeTab === 'my-work' ? 600 : 500,
                    color: activeTab === 'my-work' ? 'var(--color-brand-blue)' : 'var(--color-text-muted)',
                    backgroundColor: activeTab === 'my-work' ? '#FFFFFF' : 'transparent',
                    boxShadow: activeTab === 'my-work' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Моя работа
                </button>
              </>
            )}
          </div>
        )}

        {/* Right User Info & Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }} ref={menuRef}>
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-accent-yellow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: 'var(--color-brand-blue)',
                  fontSize: '15px',
                }}
              >
                {userRole === 'zavkaf' ? 'ЕВ' : userRole === 'nauchruk' ? 'АМ' : 'АИ'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>
                  {userRole === 'zavkaf' ? 'Елена Викторовна' : userRole === 'nauchruk' ? 'Андрей Морозов' : 'Алексей Дмитриевич'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {userRole === 'zavkaf' ? 'Заведующий кафедрой' : userRole === 'nauchruk' ? 'Научный руководитель' : 'Студент'}
                </span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-muted)"
                strokeWidth="2"
                style={{
                  transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '180px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 10,
                }}
              >
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout?.();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#EF4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Выйти
                </button>
              </div>
            )}
          </div>

          {/* Settings Button */}
          <button
            title="Настройки"
            onClick={onOpenSettings}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-brand-blue)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px 48px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          height: '60px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>ДипломНавигатор · Кабинет {userRole === 'zavkaf' ? 'заведующего кафедрой' : userRole === 'nauchruk' ? 'научного руководителя' : 'студента'}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>База знаний</a>
          <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Техподдержка</a>
          <span>v.2.4.1</span>
        </div>
      </footer>
    </div>
  );
};