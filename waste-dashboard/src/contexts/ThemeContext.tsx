import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Mode = "light" | "dark";
export type Accent = "blue" | "green" | "purple" | "rose";

interface Theme {
  mode: Mode;
  accent: Accent;
}
interface Ctx extends Theme {
  setMode: (m: Mode) => void;
  setAccent: (a: Accent) => void;
}

const DEFAULT: Theme = { mode: "light", accent: "blue" };
const STORAGE_KEY = "waste-dashboard-theme";

const ThemeCtx = createContext<Ctx>({
  ...DEFAULT,
  setMode: () => {},
  setAccent: () => {},
});

export const useTheme = () => useContext(ThemeCtx);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "") || DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  /* Apply to <html data-theme="…"> */
  useEffect(() => {
    document.documentElement.dataset.theme = `${theme.mode}-${theme.accent}`;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  return (
    <ThemeCtx.Provider
      value={{
        ...theme,
        setMode: (mode) => setTheme((t) => ({ ...t, mode })),
        setAccent: (accent) => setTheme((t) => ({ ...t, accent })),
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
};
