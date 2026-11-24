import { profile, notifications } from "../mocks/supervisorAccount";
import type {
  ProfileUpdate,
  SupervisorProfile,
  SupervisorNotification,
} from "../../entities/user/supervisorAccount";
let account = structuredClone(profile);
let items = structuredClone(notifications);
export async function fetchSupervisorProfile(): Promise<SupervisorProfile> {
  return structuredClone(account);
}
export async function updateSupervisorProfile(
  input: ProfileUpdate,
): Promise<SupervisorProfile> {
  if (
    !input.first_name.trim() ||
    !input.last_name.trim() ||
    !/^\S+@\S+\.\S+$/.test(input.email)
  )
    throw new Error("Проверьте имя и почту");
  account = { ...account, ...input };
  return structuredClone(account);
}
export async function fetchSupervisorNotifications(): Promise<
  SupervisorNotification[]
> {
  return structuredClone(items);
}
export async function markNotificationRead(
  id: number,
): Promise<SupervisorNotification[]> {
  items = items.map((n) => (n.id === id ? { ...n, is_read: true } : n));
  return structuredClone(items);
}
