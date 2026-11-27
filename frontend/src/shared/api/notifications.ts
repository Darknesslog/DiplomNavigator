import { notifications } from '../mocks/supervisorAccount';
import type { SupervisorNotification } from '../../entities/user/supervisorAccount';

export type NotificationRole = 'student' | 'nauchruk';
export type Notification = SupervisorNotification;

const inboxes: Record<NotificationRole, Notification[]> = {
    student: [],
    nauchruk: structuredClone(notifications),
};

export async function fetchNotifications(role: NotificationRole): Promise<Notification[]> {
    return structuredClone(inboxes[role]);
}

export async function markNotificationRead(role: NotificationRole, id: number): Promise<Notification[]> {
    inboxes[role] = inboxes[role].map(item =>
        item.id === id ? { ...item, is_read: true } : item
    );
    return fetchNotifications(role);
}
