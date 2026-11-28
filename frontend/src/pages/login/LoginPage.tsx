// src/pages/login/LoginPage.tsx
import React, { useState } from 'react';
import { getMe, login, saveToken } from '../../shared/api/auth';
import type { UserProfile } from '../../shared/api/auth';
import './LoginPage.css';

interface LoginPageProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const token = await login(email, password);
      saveToken(token.access_token);
      const profile = await getMe();
      onLoginSuccess(profile);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось войти');
    } finally {
      setIsLoading(false);
    }
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

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
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