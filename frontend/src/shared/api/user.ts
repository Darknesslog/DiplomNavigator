// src/shared/api/user.ts
import { MOCK_USERS } from '../mocks/user';
import type { CurrentUser } from '../mocks/user';

export const fetchCurrentUser = async (role: string): Promise<CurrentUser> => {
  return MOCK_USERS[role] || MOCK_USERS.student;
};