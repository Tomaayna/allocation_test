/* hooks/useStops.ts ------------------------------------------------------- */
import { useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Stop } from "../types";
import { AuthCtx } from "../contexts/AuthContext";

export const useStops = (date: string) => {
  const { state } = useContext(AuthCtx);
  const [stops, setStops] = useState<Stop[]>([]);
  useEffect(() => {
    if (!date) return;

    if (state !== "signedIn") return;
    
    const q = query(
      collection(db, "routes", date, "stops"),
      orderBy("order", "asc")
    );
    const unsub = onSnapshot(q, (snap) =>
      setStops(snap.docs.map((d) => d.data() as Stop))
    );
    return unsub;
  }, [date]);
  return stops;
};
