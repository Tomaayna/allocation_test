import { NavLink, Outlet } from "react-router-dom";
import { Home, FileText } from "lucide-react";

export default function CarInfoShell() {
  const linkClass =
    "block px-3 py-2 rounded hover:bg-gray-800 [&.active]:bg-gray-700";

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-gray-900 text-gray-100 flex flex-col">
        <h2 className="text-lg font-bold px-4 py-3 border-b border-gray-700">
          車両台帳
        </h2>
        <nav className="flex-1 px-2 space-y-1">
          <NavLink to="/"        className={linkClass}>
            <Home className="w-4 h-4 inline mr-1" /> メニュー
          </NavLink>
          {/* 将来、台帳サブページを足す場合はここへ */}
          <NavLink to="/carinfo" className={linkClass} end>
            <FileText className="w-4 h-4 inline mr-1" /> 車両一覧
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
