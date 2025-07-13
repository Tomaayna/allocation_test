import { type Firestore } from "firebase/firestore";
/** 前後空白除去＋小文字化 */
export declare const normalize: (s: string) => string;
/**
 * 一意キー確保トランザクション
 *  - kind     : 論理グループ名（customers / staff / vehicles）
 *  - keyParts : 一意条件に使うフィールド値
 *  - data     : 保存するオブジェクト
 *  - col      : コレクション名（省略時 kind と同じ）
 */
export declare function createUnique<T extends Record<string, unknown> = Record<string, unknown>>(db: Firestore, { kind, keyParts, data, col, }: {
    kind: "customers" | "staff" | "vehicles";
    keyParts: string[];
    data: T;
    col?: string;
}): Promise<void>;
