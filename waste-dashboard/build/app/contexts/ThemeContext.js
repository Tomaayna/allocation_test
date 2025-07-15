import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
const DEFAULT = { mode: "light", accent: "blue" };
const STORAGE_KEY = "waste-dashboard-theme";
const ThemeCtx = createContext({
    ...DEFAULT,
    setMode: () => { },
    setAccent: () => { },
});
export const useTheme = () => useContext(ThemeCtx);
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "") || DEFAULT;
        }
        catch {
            return DEFAULT;
        }
    });
    /* Apply to <html data-theme="…"> */
    useEffect(() => {
        document.documentElement.dataset.theme = `${theme.mode}-${theme.accent}`;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    }, [theme]);
    return (_jsx(ThemeCtx.Provider, { value: {
            ...theme,
            setMode: (mode) => setTheme((t) => ({ ...t, mode })),
            setAccent: (accent) => setTheme((t) => ({ ...t, accent })),
        }, children: children }));
};
