// src/shared/api/client.ts
const BASE_URL = 'http://127.0.0.1:8000';

export const apiClient = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = localStorage.getItem('access_token');

  const headers = new Headers(options.headers);
  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detail = Array.isArray(errorData.detail)
      ? errorData.detail.map((item: { msg?: string }) => item.msg).join(', ')
      : errorData.detail;
    throw new Error(detail || 'Ошибка запроса');
  }

  return response.json() as Promise<T>;
};