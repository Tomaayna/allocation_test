// src/hooks/useVehicles.ts
import { useContext, useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthCtx } from "../contexts/AuthContext";

export interface Vehicle {
  id: string;
  name: string;
  department: string;
  status: "出庫中" | "入庫中" | "修理・点検";
}

export const useVehicles = () => {
  const { state } = useContext(AuthCtx);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (state !== "signedIn") return;
    
    const unsub = onSnapshot(collection(db, "vehicles"), (snap) =>
      setVehicles(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vehicle, "id">) })),
      ),
    );
    return unsub;
  }, []);

  /** ステータス変更 → Firestore 反映 */
  const updateStatus = (id: string, status: Vehicle["status"]) =>
    updateDoc(doc(db, "vehicles", id), { status });

  return { vehicles, updateStatus };
};
