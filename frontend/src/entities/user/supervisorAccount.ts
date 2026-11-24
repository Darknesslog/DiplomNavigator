export interface SupervisorProfile {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  email: string;
  phone: string;
  department: string;
  role: "nauchruk";
  registeredAt: string | null;
  lastLogin: string | null;
}
export type ProfileUpdate = Pick<
  SupervisorProfile,
  "first_name" | "last_name" | "middle_name" | "email" | "phone" | "department"
>;
export interface SupervisorNotification {
  id: number;
  title: string;
  message: string;
  details: string;
  date: string;
  is_read: boolean;
  studentId?: number;
}
export interface Appearance {
  theme: "light" | "dark";
  contrast: number;
  font: "normal" | "large" | "largest";
}
