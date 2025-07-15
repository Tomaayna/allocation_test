import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
const DEFAULT = { startAddress: "北海道苫小牧市柳町2‑2‑8" };
export function useRouteSettings() {
    const ref = doc(db, "settings", "route");
    const [settings, setSettings] = useState(DEFAULT);
    const [loading, setLoading] = useState(true);
    /** Firestore → state */
    useEffect(() => {
        getDoc(ref).then((snap) => {
            if (snap.exists())
                setSettings(snap.data());
            setLoading(false);
        });
    }, []);
    /** 更新 API */
    const save = async (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        await setDoc(ref, next, { merge: true });
    };
    return { settings, save, loading };
}
