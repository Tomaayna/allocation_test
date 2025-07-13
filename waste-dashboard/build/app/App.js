import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from "react";
import { AuthCtx } from "./contexts/AuthContext";
import Dashboard from "./dashboard";
import Login from "./login";
export default function App() {
    const { state } = useContext(AuthCtx);
    if (state === "loading") {
        // スプラッシュやスピナーを出す
        return _jsx("div", { className: "flex h-screen items-center justify-center", children: "Loading\u2026" });
    }
    if (state === "signedOut") {
        return _jsx(Login, {});
    }
    // signedIn
    return _jsx(Dashboard, {});
}
