// src/App.tsx
import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { AuthCtx } from "./contexts/AuthContext";

import Login      from "./login";
import AppShell   from "./AppShell";        // 左メニュー付きレイアウト
import Dashboard    from "./pages/dashboard";
import CarInfo    from "./pages/CarInfo";
import CarInfoShell   from "./pages/CarInfoShell";
import HomeMenu   from "./pages/HomeMenu";
//import Settings   from "./Settings";        // ←プレースホルダで OK
// ほか masters など …

export default function App() {
  const { state } = useContext(AuthCtx);

  if (state === "loading") {
    return <div className="flex h-screen items-center justify-center">Loading…</div>;
  }
  if (state === "signedOut") {
    return <Login />;        // サイドメニューなし
  }

  /* signedIn */
  return (
    <Routes>
      {/* ─ メインメニュー ─ */}
      <Route path="/" element={<HomeMenu />} />

      {/* ─ 配車システム（既存 AppShell を流用） ─ */}
      <Route element={<AppShell />}>
        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      {/* ─ 車両台帳（独自サイドメニュー） ─ */}
      <Route element={<CarInfoShell />}>
        <Route path="carinfo" element={<CarInfo />} />
      </Route>
    </Routes>
  );
}
