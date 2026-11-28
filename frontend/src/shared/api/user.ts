// src/shared/api/user.ts
import { getMe } from './auth';
import type { UserProfile } from './auth';

export const fetchCurrentUser = async (): Promise<UserProfile> => {
  return getMe();
};