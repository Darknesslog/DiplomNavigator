import React, { useState } from 'react';

interface LoginPageProps {
  onLoginSuccess?: (role: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess?.(role);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '440px', padding: '0 20px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Поле: Логин */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
                Логин
              </label>
              <input
                type="text"
                placeholder="Введите почту или номер телефона"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '15px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-brand-blue)',
                }}
              />
            </div>

            {/* Поле: Пароль */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
                Пароль
              </label>
              <input
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '15px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-brand-blue)',
                }}
              />
            </div>

            {/* Поле: Роль */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
                Роль
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '15px',
                    outline: 'none',
                    appearance: 'none',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    color: 'var(--color-brand-blue)',
                  }}
                >
                  <option value="student">Студент</option>
                  <option value="nauchruk">Научный руководитель</option>
                  <option value="zavkaf">Заведующий кафедрой</option>
                  <option value="admin">Администратор</option>
                </select>
                <div
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: 'var(--color-accent-yellow)',
                  border: '1px solid #D99A26',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--color-text-dark)',
                  cursor: 'pointer',
                }}
              >
                Войти
              </button>
              
              <button
                type="button"
                onClick={() => alert('Переход на страницу регистрации...')}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: 'var(--color-accent-yellow)',
                  border: '1px solid #D99A26',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--color-text-dark)',
                  cursor: 'pointer',
                }}
              >
                Регистрация
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer (нейтральный, как на макете) */}
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
        <span>ДипломНавигатор · Управление выпускными работами</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Справочный центр</a>
          <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Связаться с поддержкой</a>
        </div>
      </footer>
    </div>
  );
};