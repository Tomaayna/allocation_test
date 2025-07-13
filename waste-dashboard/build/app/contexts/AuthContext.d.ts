import type { ReactNode } from "react";
type AuthState = "loading" | "signedOut" | "signedIn";
export interface AppUser {
    uid: string;
    email: string | null;
    role: "viewer" | "editor" | "admin";
    groups: string[];
}
interface ContextValue {
    state: AuthState;
    user: AppUser | null;
}
export declare const AuthCtx: import("react").Context<ContextValue>;
export declare const AuthProvider: ({ children }: {
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export {};
