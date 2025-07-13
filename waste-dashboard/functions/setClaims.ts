import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import * as admin from "firebase-admin";

admin.initializeApp();
setGlobalOptions({ region: "asia-northeast1" });

interface SetClaimsPayload {
  uid: string;
  role: "viewer" | "editor" | "admin";
  groups: string[];
}

export const setCustomClaims = onCall(
  // ← ジェネリク型は省略して OK
  async (req: CallableRequest<SetClaimsPayload>) => {
    /* 認証チェック (admin だけ許可) */
    if (!req.auth || req.auth.token.role !== "admin") {
      throw new HttpsError("permission-denied", "admin 権限のみ実行可能");
    }

    const { uid, role, groups } = req.data;
    await admin.auth().setCustomUserClaims(uid, { role, groups });

    /* 返り値オブジェクトを Promise で返す */
    return { ok: true } as const;   // ← これで型は { ok: true }
  }
);
