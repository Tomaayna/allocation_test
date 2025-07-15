"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { loginWithEmail, loginWithGoogle, } from "./lib/authApi";
import { Button, } from "./components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, } from "./components/ui/card";
/* ────────────────────────────────────────── */
export default function Login() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    /* ───────── メール/パスワード ───────── */
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await loginWithEmail(email, pass); // 認証成功→AuthContext が更新
        }
        catch (err) {
            setError(err?.message ?? "ログインに失敗しました");
        }
        finally {
            setLoading(false);
        }
    };
    /* ───────── Google ───────── */
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await loginWithGoogle();
        }
        catch (err) {
            setError(err?.message ?? "Google ログインに失敗しました");
        }
        finally {
            setLoading(false);
        }
    };
    /* ───────── UI ───────── */
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 px-8", children: _jsxs(Card, { className: "w-full max-w-sm shadow-md", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-center text-xl font-bold", children: "\u30ED\u30B0\u30A4\u30F3" }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleEmailLogin, className: "flex flex-col gap-3", children: [_jsx("input", { className: "border rounded px-3 py-2 w-full", type: "email", placeholder: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9", value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx("input", { className: "border rounded px-3 py-2 w-full", type: "password", placeholder: "\u30D1\u30B9\u30EF\u30FC\u30C9", value: pass, onChange: (e) => setPass(e.target.value), required: true }), error && (_jsx("p", { className: "text-red-600 text-sm whitespace-pre-wrap", children: error })), _jsx(Button, { type: "submit", disabled: loading, className: "w-full", children: loading ? "ログイン中…" : "メールでログイン" }), _jsx("div", { className: "text-center text-sm text-muted-foreground", children: "\u307E\u305F\u306F" }), _jsxs(Button, { type: "button", variant: "secondary", disabled: loading, onClick: handleGoogleLogin, className: "w-full flex items-center justify-center gap-2", children: [_jsxs("svg", { viewBox: "0 0 24 24", className: "w-4 h-4", "aria-hidden": true, focusable: "false", children: [_jsx("path", { fill: "currentColor", d: "M21.6 12.227c0-.814-.073-1.6-.208-2.364H12v4.48h5.4a4.615 4.615 0 01-2.002 3.025v2.502h3.238c1.893-1.744 2.964-4.31 2.964-7.643z" }), _jsx("path", { fill: "currentColor", d: "M12 22c2.7 0 4.968-.893 6.624-2.423l-3.238-2.502c-.9.603-2.054.962-3.386.962-2.6 0-4.8-1.756-5.59-4.108H3.051v2.583A9.996 9.996 0 0012 22z" }), _jsx("path", { fill: "currentColor", d: "M6.41 13.929A6 6 0 016 12c0-.67.11-1.318.31-1.929V7.488H3.051A9.996 9.996 0 002 12c0 1.64.394 3.19 1.051 4.512l3.359-2.583z" }), _jsx("path", { fill: "currentColor", d: "M12 4.875c1.468 0 2.788.506 3.83 1.496l2.874-2.877C16.966 1.756 14.7.875 12 .875a9.996 9.996 0 00-8.949 5.637l3.358 2.583C7.2 6.632 9.4 4.875 12 4.875z" })] }), "Google \u3067\u30ED\u30B0\u30A4\u30F3"] })] }) })] }) }));
}
