import { MOCK_USERS } from "./user";
import type {
  SupervisorProfile,
  SupervisorNotification,
} from "../../entities/user/supervisorAccount";
export const profile: SupervisorProfile = {
  ...MOCK_USERS.nauchruk,
  role: "nauchruk",
  phone: "",
  department: "Кафедра информационных систем",
  registeredAt: "2024-09-02",
  lastLogin: null,
};
export const notifications: SupervisorNotification[] = [
  {
    id: 1,
    title: "Работа отправлена на проверку",
    message: "Анна Иванова отправила работу на проверку.",
    details: "Откройте профиль студента для просмотра текущего этапа.",
    date: "2025-09-22T10:14:00",
    is_read: false,
    studentId: 202,
  },
  {
    id: 2,
    title: "ВКР завершена",
    message: "Мария Волкова завершила работу.",
    details: "Результат доступен в профиле студента.",
    date: "2025-09-21T11:30:00",
    is_read: true,
    studentId: 203,
  },
];
