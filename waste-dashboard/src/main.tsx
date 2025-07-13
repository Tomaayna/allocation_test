// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";                // ⬅️ ここを修正（ファイル名も大文字小文字一致）
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  </StrictMode>,
);
