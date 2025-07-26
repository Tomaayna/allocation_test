import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function HomeMenu() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <Link to="/dashboard" className="px-6 py-3 bg-blue-300 text-white rounded">
        配車システム
      </Link>
      <Link to="/carinfo" className="px-6 py-3 bg-green-300 text-white rounded">
        車両台帳
      </Link>
      <button
        onClick={() => signOut(auth)}
        className="px-6 py-3 bg-gray-300 rounded"
      >
        ログアウト
      </button>
    </div>
  );
}
