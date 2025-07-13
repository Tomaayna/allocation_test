import { useContext, useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthCtx } from "../contexts/AuthContext";
/* -------------------------------------------------------------------------- */
/* フック本体                                                                  */
/* -------------------------------------------------------------------------- */
export const useStaff = () => {
    const { state } = useContext(AuthCtx);
    const [staff, setStaff] = useState([]);
    /* ───── Firestore リアルタイム購読 ───── */
    useEffect(() => {
        if (state !== "signedIn")
            return;
        const unsub = onSnapshot(collection(db, "staff"), (snap) => {
            setStaff(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
        return unsub;
    }, []);
    /* ───── ステータス更新 ───── */
    const updateStatus = (id, status) => updateDoc(doc(db, "staff", id), { status });
    /* ───── 免許の追加 / 削除 ───── */
    const addLicense = (id, lic) => updateDoc(doc(db, "staff", id), { license: arrayUnion(lic) });
    const removeLicense = (id, lic) => updateDoc(doc(db, "staff", id), { license: arrayRemove(lic) });
    return { staff, updateStatus, addLicense, removeLicense };
};
