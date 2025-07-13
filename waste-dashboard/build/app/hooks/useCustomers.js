import { useContext, useEffect, useState } from "react";
import { collection, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthCtx } from "../contexts/AuthContext";
export const useCustomers = () => {
    const { state } = useContext(AuthCtx); // ← signedIn 判定に使う
    const [customers, setCustomers] = useState([]);
    useEffect(() => {
        if (state !== "signedIn")
            return; // ★ 未ログイン中は購読しない
        const q = collection(db, "customers");
        const unsub = onSnapshot(q, (snap) => {
            setCustomers(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
        }, (err) => console.error("customers snapshot err:", err));
        return unsub;
    }, [state]);
    return customers;
};
