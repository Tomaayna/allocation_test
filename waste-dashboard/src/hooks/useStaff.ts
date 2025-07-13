import { useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthCtx } from "../contexts/AuthContext";

/* -------------------------------------------------------------------------- */
/* 型定義                                                                      */
/* -------------------------------------------------------------------------- */
export type StaffStatus = "出勤" | "休暇";

/** スタッフ 1 人分の Firestore ドキュメント */
export interface Staff {
  id: string;                 // ドキュメント ID
  name: string;               // 氏名
  department: string;         // 部署
  status: StaffStatus;        // 出勤 or 休暇
  /** 保有免許リスト（例: ["大型", "クレーン"]） */
  license: string[];
}

/* -------------------------------------------------------------------------- */
/* フック本体                                                                  */
/* -------------------------------------------------------------------------- */
export const useStaff = () => {
  const { state } = useContext(AuthCtx);
  const [staff, setStaff] = useState<Staff[]>([]);

  /* ───── Firestore リアルタイム購読 ───── */
  useEffect(() => {
    if (state !== "signedIn") return;
    
    const unsub = onSnapshot(collection(db, "staff"), (snap) => {
      setStaff(
        snap.docs.map(
          (d) => ({ id: d.id, ...(d.data() as Omit<Staff, "id">) }) as Staff,
        ),
      );
    });
    return unsub;
  }, []);

  /* ───── ステータス更新 ───── */
  const updateStatus = (id: string, status: StaffStatus) =>
    updateDoc(doc(db, "staff", id), { status });

  /* ───── 免許の追加 / 削除 ───── */
  const addLicense = (id: string, lic: string) =>
    updateDoc(doc(db, "staff", id), { license: arrayUnion(lic) });

  const removeLicense = (id: string, lic: string) =>
    updateDoc(doc(db, "staff", id), { license: arrayRemove(lic) });

  return { staff, updateStatus, addLicense, removeLicense };
};
