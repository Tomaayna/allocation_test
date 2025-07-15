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
export declare const useTheme: () => Ctx;
export declare const ThemeProvider: ({ children }: {
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export {};
