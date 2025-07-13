// src/components/RequireRole.tsx
import { useContext, type ReactNode } from "react";
import { AuthCtx } from "../contexts/AuthContext";

type Role = "viewer" | "editor" | "admin";

export default function RequireRole({
  role,               // 要求ロール
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { state, user } = useContext(AuthCtx);

  /* まだロード中なら何も描画しない（任意でスピナー） */
  if (state === "loading") return null;

  /* 未ログインなら NG */
  if (state === "signedOut" || !user) return null;

  /* 権限判定 ---------------------------------------------------- */
  const ok =
    role === "viewer" ||                               // だれでも
    (role === "editor" && user.role !== "viewer") ||   // editor 以上
    (role === "admin" && user.role === "admin");       // admin 専用

  return ok ? children : null;
}
