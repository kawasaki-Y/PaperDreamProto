import { useState, useEffect, useCallback } from "react";

export type ThemeMode = "white" | "black" | "hybrid";

const THEME_KEY = "paper-dream-theme";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const body = document.body;

  root.classList.remove("theme-white", "theme-black", "theme-hybrid");
  root.classList.add(`theme-${theme}`);

  if (theme === "white") {
    root.style.setProperty("--background", "0 0% 100%");
    root.style.setProperty("--foreground", "0 0% 0%");
    root.style.setProperty("--card", "0 0% 97%");
    root.style.setProperty("--card-foreground", "0 0% 0%");
    root.style.setProperty("--popover", "0 0% 97%");
    root.style.setProperty("--popover-foreground", "0 0% 0%");
    root.style.setProperty("--muted", "0 0% 92%");
    root.style.setProperty("--muted-foreground", "0 0% 40%");
    root.style.setProperty("--border", "0 0% 88%");
    root.style.setProperty("--input", "0 0% 85%");
    root.style.setProperty("--primary", "262 83% 58%");
    root.style.setProperty("--primary-foreground", "0 0% 100%");
    root.style.setProperty("--secondary", "190 90% 40%");
    root.style.setProperty("--secondary-foreground", "0 0% 100%");
    root.style.setProperty("--accent", "320 80% 50%");
    root.style.setProperty("--accent-foreground", "0 0% 100%");
    root.style.setProperty("--destructive", "0 84% 50%");
    root.style.setProperty("--destructive-foreground", "0 0% 100%");
    root.style.setProperty("--ring", "262 83% 58%");
    body.style.backgroundImage = "none";
    body.style.backgroundColor = "hsl(0 0% 100%)";
  } else if (theme === "black") {
    root.style.setProperty("--background", "0 0% 10%");
    root.style.setProperty("--foreground", "0 0% 100%");
    root.style.setProperty("--card", "0 0% 13%");
    root.style.setProperty("--card-foreground", "0 0% 100%");
    root.style.setProperty("--popover", "0 0% 13%");
    root.style.setProperty("--popover-foreground", "0 0% 100%");
    root.style.setProperty("--muted", "0 0% 18%");
    root.style.setProperty("--muted-foreground", "0 0% 60%");
    root.style.setProperty("--border", "0 0% 20%");
    root.style.setProperty("--input", "0 0% 22%");
    root.style.setProperty("--primary", "262 83% 58%");
    root.style.setProperty("--primary-foreground", "0 0% 100%");
    root.style.setProperty("--secondary", "190 90% 50%");
    root.style.setProperty("--secondary-foreground", "0 0% 5%");
    root.style.setProperty("--accent", "320 80% 55%");
    root.style.setProperty("--accent-foreground", "0 0% 100%");
    root.style.setProperty("--destructive", "0 84% 60%");
    root.style.setProperty("--destructive-foreground", "0 0% 100%");
    root.style.setProperty("--ring", "262 83% 58%");
    body.style.backgroundImage =
      "radial-gradient(circle at 15% 50%, rgba(139, 92, 246, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(6, 182, 212, 0.08), transparent 25%)";
    body.style.backgroundColor = "hsl(0 0% 10%)";
  } else {
    root.style.setProperty("--background", "230 15% 18%");
    root.style.setProperty("--foreground", "0 0% 92%");
    root.style.setProperty("--card", "230 15% 22%");
    root.style.setProperty("--card-foreground", "0 0% 92%");
    root.style.setProperty("--popover", "230 15% 22%");
    root.style.setProperty("--popover-foreground", "0 0% 92%");
    root.style.setProperty("--muted", "230 10% 28%");
    root.style.setProperty("--muted-foreground", "0 0% 55%");
    root.style.setProperty("--border", "230 10% 25%");
    root.style.setProperty("--input", "230 10% 28%");
    root.style.setProperty("--primary", "262 83% 58%");
    root.style.setProperty("--primary-foreground", "0 0% 100%");
    root.style.setProperty("--secondary", "190 90% 50%");
    root.style.setProperty("--secondary-foreground", "0 0% 5%");
    root.style.setProperty("--accent", "320 80% 55%");
    root.style.setProperty("--accent-foreground", "0 0% 100%");
    root.style.setProperty("--destructive", "0 84% 60%");
    root.style.setProperty("--destructive-foreground", "0 0% 100%");
    root.style.setProperty("--ring", "262 83% 58%");
    body.style.backgroundImage =
      "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 10%) 100%)";
    body.style.backgroundColor = "";
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(THEME_KEY) as ThemeMode) || "black";
    }
    return "black";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  }, []);

  return { theme, setTheme };
}
