"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  loginWithEmail,
  loginWithGoogle,
} from "./lib/authApi";
import {
  Button,
} from "./components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "./components/ui/card";

/* ────────────────────────────────────────── */

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  /* ───────── メール/パスワード ───────── */
  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, pass);           // 認証成功→AuthContext が更新
    } catch (err: any) {
      setError(err?.message ?? "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  /* ───────── Google ───────── */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message ?? "Google ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  /* ───────── UI ───────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            ログイン
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
            <input
              className="border rounded px-3 py-2 w-full"
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="border rounded px-3 py-2 w-full"
              type="password"
              placeholder="パスワード"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />

            {error && (
              <p className="text-red-600 text-sm whitespace-pre-wrap">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "ログイン中…" : "メールでログイン"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">または</div>

            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2"
            >
              {/* FontAwesome や自前 SVG など好きなアイコンで OK */}
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                aria-hidden
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M21.6 12.227c0-.814-.073-1.6-.208-2.364H12v4.48h5.4a4.615 4.615 0 01-2.002 3.025v2.502h3.238c1.893-1.744 2.964-4.31 2.964-7.643z"
                />
                <path
                  fill="currentColor"
                  d="M12 22c2.7 0 4.968-.893 6.624-2.423l-3.238-2.502c-.9.603-2.054.962-3.386.962-2.6 0-4.8-1.756-5.59-4.108H3.051v2.583A9.996 9.996 0 0012 22z"
                />
                <path
                  fill="currentColor"
                  d="M6.41 13.929A6 6 0 016 12c0-.67.11-1.318.31-1.929V7.488H3.051A9.996 9.996 0 002 12c0 1.64.394 3.19 1.051 4.512l3.359-2.583z"
                />
                <path
                  fill="currentColor"
                  d="M12 4.875c1.468 0 2.788.506 3.83 1.496l2.874-2.877C16.966 1.756 14.7.875 12 .875a9.996 9.996 0 00-8.949 5.637l3.358 2.583C7.2 6.632 9.4 4.875 12 4.875z"
                />
              </svg>
              Google でログイン
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
