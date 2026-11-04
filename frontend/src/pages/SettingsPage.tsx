import React, { useState } from 'react';

interface SettingsPageProps {
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'accessibility'>('profile');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [textSize, setTextSize] = useState<number>(50); // Процент ползунка размера текста
  const [highContrast, setHighContrast] = useState<boolean>(false);

  return (
    <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', width: '100%' }}>
      {/* Sidebar Navigation */}
      <div
        style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {[
          { id: 'profile', label: 'Профиль', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
          { id: 'security', label: 'Безопасность', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
          { id: 'appearance', label: 'Внешний вид', icon: 'M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z' },
          { id: 'accessibility', label: 'Доступность', icon: 'M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0 4z M12 10v6 M8 13h8 M9 22l3-6 3 6' }
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{
                width: '100%',
                height: '48px',
                padding: '0 16px',
                backgroundColor: isActive ? '#F0F4F8' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                color: isActive ? '#315783' : '#5B6577',
                fontSize: '15px',
                fontWeight: isActive ? 600 : 500,
                transition: 'background-color 0.2s, color 0.2s',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={item.icon} />
              </svg>
              {item.label}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }} />

        {/* Logout Button */}
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            height: '48px',
            padding: '0 16px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            color: '#9B3F39',
            fontSize: '15px',
            fontWeight: 500,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B3F39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Выйти
        </button>
      </div>

      {/* Main Content Sections */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-brand-blue)', marginBottom: '8px' }}>
            Настройки аккаунта
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-muted)' }}>
            Управляйте своими личными данными, безопасностью и предпочтениями интерфейса.
          </p>
        </div>

        {/* Section 1: Личные данные */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
            Личные данные
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Имя</label>
              <input
                type="text"
                defaultValue="Алексей"
                style={{
                  height: '44px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '15px',
                  outline: 'none',
                  color: 'var(--color-brand-blue)',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Фамилия</label>
              <input
                type="text"
                defaultValue="Дмитриевич"
                style={{
                  height: '44px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '15px',
                  outline: 'none',
                  color: 'var(--color-brand-blue)',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Электронная почта *</label>
              <input
                type="email"
                defaultValue="alexey.d@university.ru"
                style={{
                  height: '44px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '15px',
                  outline: 'none',
                  color: 'var(--color-brand-blue)',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Кафедра</label>
              <input
                type="text"
                defaultValue="Информационных систем и технологий"
                disabled
                style={{
                  height: '44px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#F8FAFC',
                  fontSize: '15px',
                  outline: 'none',
                  color: 'var(--color-text-muted)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Безопасность */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
            Безопасность
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Текущий пароль</label>
              <input
                type="password"
                defaultValue="••••••••"
                style={{
                  height: '44px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '15px',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Новый пароль</label>
              <input
                type="password"
                defaultValue="••••••••"
                style={{
                  height: '44px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '15px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Внешний вид */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
            Внешний вид
          </h3>
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Выберите цветовую тему интерфейса</span>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Светлая тема */}
            <div
              onClick={() => setTheme('light')}
              style={{
                width: '200px',
                height: '110px',
                borderRadius: '12px',
                border: `2px solid ${theme === 'light' ? '#315783' : 'var(--color-border)'}`,
                backgroundColor: '#FFFFFF',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div style={{ width: '100%', height: '50px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', padding: '6px', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-accent-yellow)', borderRadius: '3px' }} />
                <div style={{ width: '40px', height: '6px', backgroundColor: '#CBD5E1', borderRadius: '2px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-blue)' }}>Светлая</span>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${theme === 'light' ? '#315783' : '#CBD5E1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {theme === 'light' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#315783' }} />}
                </div>
              </div>
            </div>

            {/* Темная тема */}
            <div
              onClick={() => setTheme('dark')}
              style={{
                width: '200px',
                height: '110px',
                borderRadius: '12px',
                border: `2px solid ${theme === 'dark' ? '#315783' : 'var(--color-border)'}`,
                backgroundColor: '#242B33',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div style={{ width: '100%', height: '50px', backgroundColor: '#1E2428', borderRadius: '6px', display: 'flex', alignItems: 'center', padding: '6px', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-accent-yellow)', borderRadius: '3px' }} />
                <div style={{ width: '40px', height: '6px', backgroundColor: '#475569', borderRadius: '2px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>Темная</span>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${theme === 'dark' ? '#315783' : '#64748B'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {theme === 'dark' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#315783' }} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Доступность */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-brand-blue)' }}>
            Доступность
          </h3>

          {/* Размер текста */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Размер текста</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#315783' }}>Стандартный (100%)</span>
            </div>
            
            {/* Ползунок */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '24px' }}>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', position: 'relative' }}>
                <div style={{ width: '50%', height: '100%', backgroundColor: '#4D6F91', borderRadius: '3px' }} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #4D6F91',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              <span>Мелкий</span>
              <span>Стандартный</span>
              <span>Крупный</span>
            </div>
          </div>

          {/* Высокая контрастность */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Высокая контрастность</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Увеличивает контрастность текста и элементов интерфейса.</div>
            </div>
            <div
              onClick={() => setHighContrast(!highContrast)}
              style={{
                width: '48px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: highContrast ? '#315783' : '#CBD5E1',
                padding: '2px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: highContrast ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button
            style={{
              padding: '0 24px',
              height: '44px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--color-text-dark)',
              cursor: 'pointer',
            }}
          >
            Отмена
          </button>
          <button
            style={{
              padding: '0 24px',
              height: '44px',
              backgroundColor: 'var(--color-accent-yellow)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--color-brand-blue)',
              cursor: 'pointer',
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};