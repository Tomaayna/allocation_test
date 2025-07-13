import { type ReactNode } from "react";
type Role = "viewer" | "editor" | "admin";
export default function RequireRole({ role, // 要求ロール
children, }: {
    role: Role;
    children: ReactNode;
}): ReactNode;
export {};
