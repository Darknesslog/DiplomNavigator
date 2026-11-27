import { MOCK_USERS } from '../mocks/user';

export interface StudentProfile {
    first_name: string;
    last_name: string;
    middle_name: string | null;
    email: string;
    phone: string;
    registeredAt: string | null;
    lastLogin: string | null;
}
export type StudentProfileUpdate = Omit<StudentProfile, 'registeredAt' | 'lastLogin'>;
let profile: StudentProfile = {
    ...MOCK_USERS.student,
    phone: '',
    registeredAt: null,
    lastLogin: null,
};
export async function fetchStudentProfile(): Promise<StudentProfile> {
    return structuredClone(profile);
}
export async function updateStudentProfile(input: StudentProfileUpdate): Promise<StudentProfile> {
    if (!input.first_name.trim() || !input.last_name.trim() || !/^\S+@\S+\.\S+$/.test(input.email)) {
        throw new Error('Проверьте имя и почту');
    }
    profile = { ...profile, ...input };
    return fetchStudentProfile();
}
