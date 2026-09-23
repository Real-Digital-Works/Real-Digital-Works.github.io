"use client";

import { useEffect, useState } from "react";

const KEY = "rdw-theme";

type Theme = "light" | "dark";

function readTheme(): Theme {
  const stored = document.documentElement.getAttribute("data-theme");
  return stored === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore private mode */
  }
  window.dispatchEvent(new Event("rdw:theme"));
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function set(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  return (
    <div className="theme-rail" role="group" aria-label="Colour theme">
      <button
        type="button"
        aria-pressed={theme === "dark"}
        onClick={() => set("dark")}
      >
        Dark
      </button>
      <button
        type="button"
        aria-pressed={theme === "light"}
        onClick={() => set("light")}
      >
        Light
      </button>
    </div>
  );
}
