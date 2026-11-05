export const ADMIN_THEME_KEY = "rdw-admin-theme";
export type AdminTheme = "light" | "dark";

export function readAdminTheme(): AdminTheme {
  try {
    const stored = localStorage.getItem(ADMIN_THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* private mode */
  }
  return "light";
}

export function writeAdminTheme(theme: AdminTheme) {
  try {
    localStorage.setItem(ADMIN_THEME_KEY, theme);
  } catch {
    /* private mode */
  }
}
