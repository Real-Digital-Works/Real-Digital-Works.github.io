"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  readAdminTheme,
  writeAdminTheme,
  type AdminTheme,
} from "@/lib/admin-theme";

const AdminThemeContext = createContext<{
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
}>({
  theme: "light",
  setTheme: () => {},
});

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>("light");

  useEffect(() => {
    setThemeState(readAdminTheme());
  }, []);

  const setTheme = useCallback((next: AdminTheme) => {
    setThemeState(next);
    writeAdminTheme(next);
  }, []);

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme }}>
      <div className="admin-shell min-h-screen font-sans" data-admin-theme={theme}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

export function AdminThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useAdminTheme();
  const isLight = theme === "light";

  return (
    <div
      className={`flex items-center rounded-xl border border-white/10 p-0.5 ${compact ? "gap-0" : "w-full"}`}
      role="group"
      aria-label="Admin colour theme"
    >
      <button
        type="button"
        aria-pressed={isLight}
        onClick={() => setTheme("light")}
        className={`flex-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
          isLight ? "bg-[#1857EC] text-white" : "text-white/50 hover:text-white/80"
        }`}
      >
        Light
      </button>
      <button
        type="button"
        aria-pressed={!isLight}
        onClick={() => setTheme("dark")}
        className={`flex-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
          !isLight ? "bg-[#1857EC] text-white" : "text-white/50 hover:text-white/80"
        }`}
      >
        Dark
      </button>
    </div>
  );
}
