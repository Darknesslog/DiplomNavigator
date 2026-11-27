import { fetchNotifications, markNotificationRead as markRead } from './notifications';
import { profile } from '../mocks/supervisorAccount';
import type { ProfileUpdate, SupervisorProfile } from '../../entities/user/supervisorAccount';
let account = structuredClone(profile);
export async function fetchSupervisorProfile(): Promise<SupervisorProfile> { return structuredClone(account) }
export async function updateSupervisorProfile(input: ProfileUpdate): Promise<SupervisorProfile> { if (!input.first_name.trim() || !input.last_name.trim() || !/^\S+@\S+\.\S+$/.test(input.email)) throw new Error('Проверьте имя и почту'); account = { ...account, ...input }; return structuredClone(account) }
export function fetchSupervisorNotifications() {
    return fetchNotifications('nauchruk');
}
export function markNotificationRead(id: number) {
    return markRead('nauchruk', id);
}
