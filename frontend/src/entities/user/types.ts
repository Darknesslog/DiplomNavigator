// src/entities/user/types.ts
export type UserRole = 'student' | 'nauchruk' | 'zavkaf' | 'admin';

export interface UserProfile {
  id: number;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  middle_name: string | null;
}

export interface Student {
  id: number;
  name: string;
  group: string;
  topic: string;
  progress: number;
  status: string;
}