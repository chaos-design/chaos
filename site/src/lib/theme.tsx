"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "chaos-theme";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: "dark", setTheme: () => {} });

/**
 * Light/dark switching for the whole page. Dark is the default (and the only
 * thing that paints before this provider mounts): the pre-hydration script in
 * `layout.tsx` restores the stored preference onto
 * `document.documentElement[data-theme]` so there is never a theme flash.
 *
 * All surfaces read CSS custom properties from `globals.css` — toggling the
 * attribute re-skins the page, no component re-paint logic needed.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Adopt whatever the pre-hydration script resolved (default is dark).
  useEffect(() => {
    setThemeState(
      document.documentElement.dataset.theme === "light" ? "light" : "dark",
    );
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private browsing — the toggle still works for the session
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
