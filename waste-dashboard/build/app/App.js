import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthCtx } from "./contexts/AuthContext";
import Login from "./login";
import AppShell from "./AppShell"; // 左メニュー付きレイアウト
import Dashboard from "./pages/dashboard";
import VehicleMaster from "./pages/masters/VehicleMaster";
import StaffMaster from "./pages/masters/StaffMaster";
import CustomerMaster from "./pages/masters/CustomerMaster";
import NotificationSetting from "./pages/settings/NotificationSetting";
import RouteParamSetting from "./pages/settings/RouteParamSetting";
import DataIOSetting from "./pages/settings/DataIOSetting";
import ThemeSetting from "./pages/settings/ThemeSetting";
//import Settings   from "./Settings";        // ←プレースホルダで OK
// ほか masters など …
export default function App() {
    const { state } = useContext(AuthCtx);
    if (state === "loading") {
        return _jsx("div", { className: "flex h-screen items-center justify-center", children: "Loading\u2026" });
    }
    if (state === "signedOut") {
        return _jsx(Login, {}); // サイドメニューなし
    }
    /* signedIn */
    return (_jsx(Routes, { children: _jsxs(Route, { element: _jsx(AppShell, {}), children: [_jsx(Route, { index: true, element: _jsx(Dashboard, {}) }), _jsxs(Route, { path: "masters", children: [_jsx(Route, { path: "vehicles", element: _jsx(VehicleMaster, {}) }), _jsx(Route, { path: "staff", element: _jsx(StaffMaster, {}) }), _jsx(Route, { path: "customers", element: _jsx(CustomerMaster, {}) })] }), _jsxs(Route, { path: "settings", children: [_jsx(Route, { path: "notifications", element: _jsx(NotificationSetting, {}) }), _jsx(Route, { path: "route-params", element: _jsx(RouteParamSetting, {}) }), _jsx(Route, { path: "data-io", element: _jsx(DataIOSetting, {}) }), _jsx(Route, { path: "theme", element: _jsx(ThemeSetting, {}) })] })] }) }));
}
