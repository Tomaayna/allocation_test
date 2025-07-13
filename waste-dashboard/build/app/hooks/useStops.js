/* hooks/useStops.ts ------------------------------------------------------- */
import { useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthCtx } from "../contexts/AuthContext";
export const useStops = (date) => {
    const { state } = useContext(AuthCtx);
    const [stops, setStops] = useState([]);
    useEffect(() => {
        if (!date)
            return;
        if (state !== "signedIn")
            return;
        const q = query(collection(db, "routes", date, "stops"), orderBy("order", "asc"));
        const unsub = onSnapshot(q, (snap) => setStops(snap.docs.map((d) => d.data())));
        return unsub;
    }, [date]);
    return stops;
};
