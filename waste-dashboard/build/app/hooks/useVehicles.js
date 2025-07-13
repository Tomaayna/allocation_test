// src/hooks/useVehicles.ts
import { useContext, useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthCtx } from "../contexts/AuthContext";
export const useVehicles = () => {
    const { state } = useContext(AuthCtx);
    const [vehicles, setVehicles] = useState([]);
    useEffect(() => {
        if (state !== "signedIn")
            return;
        const unsub = onSnapshot(collection(db, "vehicles"), (snap) => setVehicles(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
        return unsub;
    }, []);
    /** ステータス変更 → Firestore 反映 */
    const updateStatus = (id, status) => updateDoc(doc(db, "vehicles", id), { status });
    return { vehicles, updateStatus };
};
