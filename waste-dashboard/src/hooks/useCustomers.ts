import { useContext, useEffect, useState } from "react";
import { collection, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthCtx } from "../contexts/AuthContext";
import type { Customer } from "../types";

export const useCustomers = () => {
  const { state } = useContext(AuthCtx);        // ← signedIn 判定に使う
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (state !== "signedIn") return;           // ★ 未ログイン中は購読しない

    const q = collection(db, "customers");
    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot) => {
        setCustomers(
          snap.docs.map((d) => ({ ...(d.data() as Customer),id: d.id })),
        );
      },
      (err) => console.error("customers snapshot err:", err),
    );
    return unsub;
  }, [state]);

  return customers;
};
