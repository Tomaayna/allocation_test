// src/AppShell.tsx
import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  Truck,
  Users,
  Boxes,
  Home,
} from "lucide-react";

export default function AppShell() {
  return (
    <div className="flex h-screen">
      {/* ─ 左メニュー ─ */}
      <aside className="w-56 bg-gray-900 text-gray-100 flex flex-col">
        <h2 className="text-lg font-bold px-4 py-3 border-b border-gray-700">
          配車システム
        </h2>

        {/* ── メインメニュー ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">

          <NavItem to="/" icon={<Home />} label="メニュー" exact />
          {/* Dashboard */}
          <NavItem to="/" icon={<LayoutDashboard className="w-4 h-4" />} label="ダッシュボード" exact />

          {/* Masters （Accordion または単純リンク） */}
          <p className="px-3 mt-4 mb-1 text-xs text-gray-400">マスタ</p>
          <NavItem to="/masters/vehicles"  icon={<Truck className="w-4 h-4" />} label="車両マスタ" />
          <NavItem to="/masters/staff"     icon={<Users className="w-4 h-4" />} label="社員マスタ" />
          <NavItem to="/masters/customers" icon={<Boxes className="w-4 h-4" />} label="顧客マスタ" />

          {/* Settings */}
          <p className="px-3 mt-4 mb-1 text-xs text-gray-400">設定</p>
          <NavItem to="/settings/notifications" icon={<SettingsIcon className="w-4 h-4" />} label="通知設定" />
          <NavItem to="/settings/route-params"   icon={<SettingsIcon className="w-4 h-4" />} label="ルート生成" />
          <NavItem to="/settings/data-io"        icon={<SettingsIcon className="w-4 h-4" />} label="データ入出力" />
          <NavItem to="/settings/theme"          icon={<SettingsIcon className="w-4 h-4" />} label="テーマ" />
        </nav>
      </aside>

      {/* 右側：ページ */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}

/* NavItem 共通化 */
function NavItem({
  to,
  icon,
  label,
  exact = false,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 px-3 py-2 rounded text-sm font-medium",
          isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800",
        ].join(" ")
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
