// src/hooks/useVehicles.ts
import { useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  //setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthCtx } from "../contexts/AuthContext";
import Papa from "papaparse";
import type  { ParseResult } from "papaparse";

/* -------------------------------------------------------------------------- */
/* 型定義                                                                      */
/* -------------------------------------------------------------------------- */
export interface Vehicle {
  id: string;
  name: string;
  department: string;
  status: "出庫中" | "入庫中" | "修理・点検";
  weightLimit?: number;      // 追加：積載量(t)
  plateNo?: string;          // 追加：ナンバー
  createdAt?: any;           // Firestore タイムスタンプ
}

type NewVehicle = Omit<Vehicle, "id" | "createdAt">;


/* ───────── CSV Export ───────── */
export const vehiclesToCsv = (list: Vehicle[]): Blob => {
  const rows = list.map((v) => ({
    name: v.name,
    department: v.department ?? "",
    status: v.status,
    weightLimit: v.weightLimit ?? "",
    plateNo: v.plateNo ?? "",
  }));
  const csv = Papa.unparse(rows, { quotes: false, skipEmptyLines: true });
  const csvWithBom = "\uFEFF" + csv;
  return new Blob([csvWithBom], { type: "text/csv;charset=utf-8" });
};

/* ───────── CSV Import ───────── */
export const importVehiclesCsv = async (file: File) => {
  return new Promise<void>((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res: ParseResult<any>) => {
        try {
          const batch = writeBatch(db);

          // 1) 既存一覧を取得して名前＋ナンバー重複判定用に Map 作成
          const oldSnap = await getDocs(collection(db, "vehicles"));
          const exists = new Set(
            oldSnap.docs.map(
              (d) => `${d.get("name")}_${d.get("plateNo") ?? ""}`,
            ),
          );

          // 2) 行を loop
          res.data.forEach((row: any) => {
            const key = `${row.name}_${row.plateNo ?? ""}`;
            if (exists.has(key)) return; // 重複スキップ

            const ref = doc(collection(db, "vehicles"));
            batch.set(ref, {
              name: row.name,
              department: row.department || "",
              status:
                row.status === "出庫中" ||
                row.status === "修理・点検"
                  ? row.status
                  : "入庫中",
              weightLimit: row.weightLimit
                ? Number(row.weightLimit)
                : undefined,
              plateNo: row.plateNo || undefined,
              createdAt: serverTimestamp(),
            });
          });

          await batch.commit();
          resolve();
        } catch (err) {
          reject(err);
        }
      },
      error: reject,
    });
  });
};

/* -------------------------------------------------------------------------- */
/* Hook 本体                                                                    */
/* -------------------------------------------------------------------------- */
export const useVehicles = () => {
  const { state } = useContext(AuthCtx);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  /* ───────── リアルタイム購読 ───────── */
  useEffect(() => {
    if (state !== "signedIn") return;

    const unsub = onSnapshot(collection(db, "vehicles"), (snap) =>
      setVehicles(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vehicle, "id">) })),
      ),
    );
    return unsub;
  }, [state]);

  /* ───────── CRUD ラッパ ───────── */

  /** 重複チェック（同名 & 同ナンバー） */
  const exists = async (name: string, plateNo?: string) => {
    const q = query(
      collection(db, "vehicles"),
      where("name", "==", name),
      where("plateNo", "==", plateNo ?? null),
    );
    const snap = await getDocs(q);
    return !snap.empty;
  };

  /** 追加 */
  const createVehicle = async (data: NewVehicle) => {
    if (await exists(data.name, data.plateNo))
      throw new Error("同じ名前・ナンバーの車両が既に存在します");

    await addDoc(collection(db, "vehicles"), {
      ...data,
      createdAt: serverTimestamp(),
    });
  };

  /** 更新（部分更新） */
  const updateVehicle = async (id: string, patch: Partial<NewVehicle>) => {
    if (patch.name || patch.plateNo) {
      // 重複チェック (自分以外)
      const dup = await exists(patch.name ?? "", patch.plateNo);
      if (dup)
        throw new Error("同じ名前・ナンバーの車両が既に存在します");
    }
    await updateDoc(doc(db, "vehicles", id), patch);
  };

  /** 削除 */
  const removeVehicle = (id: string) => deleteDoc(doc(db, "vehicles", id));

  /** ステータスのみ変更（既存実装互換） */
  const updateStatus = (id: string, status: Vehicle["status"]) =>
    updateDoc(doc(db, "vehicles", id), { status });

  return {
    vehicles,
    /* 既存 */
    updateStatus,
    /* 追加 */
    createVehicle,
    updateVehicle,
    removeVehicle,
  };
};
