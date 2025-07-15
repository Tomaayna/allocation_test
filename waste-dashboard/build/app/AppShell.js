import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/AppShell.tsx
import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Settings as SettingsIcon, Truck, Users, Boxes, } from "lucide-react";
export default function AppShell() {
    return (_jsxs("div", { className: "flex h-screen", children: [_jsxs("aside", { className: "w-56 bg-gray-900 text-gray-100 flex flex-col", children: [_jsx("h2", { className: "text-lg font-bold px-4 py-3 border-b border-gray-700", children: "\u914D\u8ECA\u30B7\u30B9\u30C6\u30E0" }), _jsxs("nav", { className: "flex-1 overflow-y-auto px-2 py-4 space-y-1", children: [_jsx(NavItem, { to: "/", icon: _jsx(LayoutDashboard, { className: "w-4 h-4" }), label: "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9", exact: true }), _jsx("p", { className: "px-3 mt-4 mb-1 text-xs text-gray-400", children: "\u30DE\u30B9\u30BF" }), _jsx(NavItem, { to: "/masters/vehicles", icon: _jsx(Truck, { className: "w-4 h-4" }), label: "\u8ECA\u4E21\u30DE\u30B9\u30BF" }), _jsx(NavItem, { to: "/masters/staff", icon: _jsx(Users, { className: "w-4 h-4" }), label: "\u793E\u54E1\u30DE\u30B9\u30BF" }), _jsx(NavItem, { to: "/masters/customers", icon: _jsx(Boxes, { className: "w-4 h-4" }), label: "\u9867\u5BA2\u30DE\u30B9\u30BF" }), _jsx("p", { className: "px-3 mt-4 mb-1 text-xs text-gray-400", children: "\u8A2D\u5B9A" }), _jsx(NavItem, { to: "/settings/notifications", icon: _jsx(SettingsIcon, { className: "w-4 h-4" }), label: "\u901A\u77E5\u8A2D\u5B9A" }), _jsx(NavItem, { to: "/settings/route-params", icon: _jsx(SettingsIcon, { className: "w-4 h-4" }), label: "\u30EB\u30FC\u30C8\u751F\u6210" }), _jsx(NavItem, { to: "/settings/data-io", icon: _jsx(SettingsIcon, { className: "w-4 h-4" }), label: "\u30C7\u30FC\u30BF\u5165\u51FA\u529B" }), _jsx(NavItem, { to: "/settings/theme", icon: _jsx(SettingsIcon, { className: "w-4 h-4" }), label: "\u30C6\u30FC\u30DE" })] })] }), _jsx("main", { className: "flex-1 overflow-auto bg-gray-50", children: _jsx(Outlet, {}) })] }));
}
/* NavItem 共通化 */
function NavItem({ to, icon, label, exact = false, }) {
    return (_jsxs(NavLink, { to: to, end: exact, className: ({ isActive }) => [
            "flex items-center gap-2 px-3 py-2 rounded text-sm font-medium",
            isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800",
        ].join(" "), children: [icon, label] }));
}
