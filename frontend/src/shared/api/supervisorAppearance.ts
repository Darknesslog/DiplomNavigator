import type { Appearance } from "../../entities/user/supervisorAccount";
const STORAGE_KEY = "supervisor-appearance-v2";
const DEFAULT_APPEARANCE: Appearance = {
  theme: "light",
  contrast: 0,
  font: "normal",
};
export function readAppearance(): Appearance {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const previous =
      saved ??
      JSON.parse(localStorage.getItem("supervisor-appearance") || "null");
    return {
      theme: saved?.theme === "dark" ? "dark" : "light",
      contrast: 0,
      font:
        previous?.font === "large" || previous?.font === "largest"
          ? previous.font
          : "normal",
    };
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}
export function saveAppearance(value: Appearance): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}
