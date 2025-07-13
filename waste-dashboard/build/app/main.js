import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App"; // ⬅️ ここを修正（ファイル名も大文字小文字一致）
import "./index.css";
createRoot(document.getElementById("root")).render(_jsx(StrictMode, { children: _jsxs(AuthProvider, { children: [_jsx(App, {}), _jsx(Toaster, { richColors: true, position: "top-right" })] }) }));
