// src/pages/login/LoginPage.tsx
import React, { useState } from 'react';
import './LoginPage.css';

interface LoginPageProps {
  onLoginSuccess: (role: 'student' | 'nauchruk' | 'zavkaf') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'nauchruk' | 'zavkaf'>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(role);
  };

  return (
    <div className="login-shell">
      <header className="login-header">
        <div className="login-brand">
          <div className="brand-logo">Д</div>
          <span className="brand-title">ДипломНавигатор</span>
        </div>
      </header>

      <main className="login-main">
        <div className="login-form-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Логин</label>
              <input
                type="email"
                className="form-input"
                placeholder="Введите почту"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input
                type="password"
                className="form-input"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Роль (для демо)</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'nauchruk' | 'zavkaf')}
              >
                <option value="student">Студент</option>
                <option value="nauchruk">Научный руководитель</option>
                <option value="zavkaf">Заведующий кафедрой</option>
              </select>
            </div>

            <button type="submit" className="btn-primary">
              Войти
            </button>
          </form>
        </div>
      </main>

      <footer className="login-footer">
        <span>ДипломНавигатор · Управление выпускными работами</span>
        <span>v.2.4.1</span>
      </footer>
    </div>
  );
};