import { runTransaction, doc, collection, } from "firebase/firestore";
/** 前後空白除去＋小文字化 */
export const normalize = (s) => s.trim().toLowerCase();
/**
 * 一意キー確保トランザクション
 *  - kind     : 論理グループ名（customers / staff / vehicles）
 *  - keyParts : 一意条件に使うフィールド値
 *  - data     : 保存するオブジェクト
 *  - col      : コレクション名（省略時 kind と同じ）
 */
export async function createUnique(db, { kind, keyParts, data, col, }) {
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
        tx.set(doc(targetCol), data);
    });
}
