import { useContext } from "react";
import { AuthCtx } from "./contexts/AuthContext";
import Dashboard from "./dashboard";
import Login from "./login";

export default function App() {
  const { state } = useContext(AuthCtx);

  if (state === "loading") {
    // スプラッシュやスピナーを出す
    return <div className="flex h-screen items-center justify-center">Loading…</div>;
  }

  if (state === "signedOut") {
    return <Login />;
  }

  // signedIn
  return <Dashboard />;
}
