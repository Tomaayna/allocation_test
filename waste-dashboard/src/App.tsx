// src/App.tsx
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthCtx } from "./contexts/AuthContext";

import Login      from "./login";
import AppShell   from "./AppShell";        // 左メニュー付きレイアウト
import Dashboard    from "./pages/dashboard";
import VehicleMaster   from "./pages/masters/VehicleMaster";
import StaffMaster     from "./pages/masters/StaffMaster";
import CustomerMaster  from "./pages/masters/CustomerMaster";
import NotificationSetting from "./pages/settings/NotificationSetting";
import RouteParamSetting   from "./pages/settings/RouteParamSetting";
import DataIOSetting       from "./pages/settings/DataIOSetting";
import ThemeSetting        from "./pages/settings/ThemeSetting";
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
      {/* レイアウト Route に AppShell を噛ませる */}
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        {/* ----- マスタ ----- */}
        <Route path="masters">
          <Route path="vehicles"   element={<VehicleMaster />} />
          <Route path="staff"      element={<StaffMaster />} />
          <Route path="customers"  element={<CustomerMaster />} />
        </Route>
        <Route path="settings" >
        {/* masters などもここに追加 */}
          <Route path="notifications" element={<NotificationSetting />} />
          <Route path="route-params"   element={<RouteParamSetting />} />
          <Route path="data-io"        element={<DataIOSetting />} />
          <Route path="theme"          element={<ThemeSetting />} />
        </Route>
      </Route>
    </Routes>
  );
}
