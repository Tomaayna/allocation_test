// src/AppShell.tsx
import { Outlet, NavLink } from "react-router-dom";
import { Home, Settings } from "lucide-react";

export default function AppShell() {
  return (
    <div className="flex h-screen">
      {/* ─ 左メニュー ─ */}
      <aside className="w-56 bg-gray-900 text-gray-100 flex flex-col">
        <h2 className="text-lg font-bold px-4 py-3 border-b border-gray-700">
          配車システム
        </h2>

        <nav className="flex-1 px-2 space-y-1">
          <Nav to="/" icon={<Home />} label="ダッシュボード" />
          <Nav to="/settings" icon={<Settings />} label="設定" />
        </nav>
      </aside>

      {/* ─ 右側にページ差し込み ─ */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}

function Nav({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      end
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
