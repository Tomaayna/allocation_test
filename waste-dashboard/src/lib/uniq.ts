import {
  runTransaction,
  doc,
  collection,
  type Firestore,
  type DocumentData,
  type WithFieldValue,
} from "firebase/firestore";

/** 前後空白除去＋小文字化 */
export const normalize = (s: string) => s.trim().toLowerCase();

/**
 * 一意キー確保トランザクション
 *  - kind     : 論理グループ名（customers / staff / vehicles）
 *  - keyParts : 一意条件に使うフィールド値
 *  - data     : 保存するオブジェクト
 *  - col      : コレクション名（省略時 kind と同じ）
 */
export async function createUnique<
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  db: Firestore,
  {
    kind,
    keyParts,
    data,
    col,
  }: {
    kind: "customers" | "staff" | "vehicles";
    keyParts: string[];
    data: T;
    col?: string;
  },
) {
  const key = `${kind}#` + keyParts.map(normalize).join("#"); // customers#tomas#tokyo

  await runTransaction(db, async (tx) => {
    /* ① uniqueKeys に予約ドキュメント */
    const uniqRef = doc(db, "uniqueKeys", key);
    if ((await tx.get(uniqRef)).exists()) {
      throw new Error("duplicate"); // ← 重複
    }
    tx.set(uniqRef, {}); // 空オブジェクトで OK

    /* ② 本体ドキュメントを作成 */
    const targetCol = collection(db, col ?? kind);
    tx.set(
      doc(targetCol),
      data as WithFieldValue<DocumentData>, // 型を DocumentData へキャスト
    );
  });
}
