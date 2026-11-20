// src/shared/mocks/user.ts
export interface CurrentUser {
  id: number;
  email: string;
  role: 'student' | 'nauchruk' | 'zavkaf' | 'admin';
  first_name: string;
  last_name: string;
  middle_name: string | null;
}

export const MOCK_USERS: Record<string, CurrentUser> = {
  student: {
    id: 1,
    email: 'alexey.ivanov@university.ru',
    role: 'student',
    first_name: 'Алексей',
    last_name: 'Иванов',
    middle_name: 'Дмитриевич',
  },
  nauchruk: {
    id: 2,
    email: 'andrey.morozov@university.ru',
    role: 'nauchruk',
    first_name: 'Андрей',
    last_name: 'Морозов',
    middle_name: 'Сергеевич',
  },
  zavkaf: {
    id: 3,
    email: 'elena.petrova@university.ru',
    role: 'zavkaf',
    first_name: 'Елена',
    last_name: 'Петрова',
    middle_name: 'Викторовна',
  },
};