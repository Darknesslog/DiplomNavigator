// src/shared/api/auth.ts
import { apiClient } from './client';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: number;
  email: string;
  role: 'student' | 'nauchruk' | 'zavkaf' | 'admin';
  first_name: string;
  last_name: string;
  middle_name: string | null;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch('http://127.0.0.1:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Неверный логин или пароль');
  }
  return response.json();
};

export const getMe = (): Promise<UserProfile> => apiClient('/auth/me');