"use client";

import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "smartmall_theme";

/** Browser-chrome colour per theme — mirrors --bg in globals.css. */
const THEME_COLOR: Record<Theme, string> = {
  dark: "#0b0a09",
  light: "#ece9e2",
};

/**
 * The static `viewport.themeColor` in the root layout can only describe one
 * theme, so the meta tag is re-pointed here whenever the user switches.
 */
function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[t]);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    // Default to dark — only go light if explicitly stored
    const initial = stored ?? "dark";
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    localStorage.setItem(STORAGE_KEY, t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle, mounted };
}
