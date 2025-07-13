/**
 * customers/{customerId} が作成されたら
 * 住所→lat/lng を補完する 2nd-Gen Cloud Functions
 * リージョンは Firestore と同じ asia-northeast1
 */
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fetch from "node-fetch";

initializeApp();                 // ★必須
const db = getFirestore();
const GOOGLE_MAPS_API_KEY = defineSecret("GOOGLE_MAPS_API_KEY");

/* -------------------------------------------------------------------------- */
/* メイン関数 ─ options + handler（引数は 2 つだけ）                            */
/* -------------------------------------------------------------------------- */
export const geocodeOnCustomerCreate = onDocumentCreated(
  {
    region: "asia-southeast1",                 // Firestore と合わせる
    document: "customers/{customerId}",        // 監視するドキュメントパス
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (event): Promise<void> => {
    const snap = event.data;
    if (!snap) return;

    // 型を明示して any エラーを避ける
    const data = snap.data() as {
      address?: string;
      lat?: number;
      lng?: number;
      client?: string;
    };
    console.log("🔥 onCustomerCreate fired");
    if (!data?.address || data.lat || data.lng) return; // 処理済みなら抜ける

    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        data.address,
      )}&key=${GOOGLE_MAPS_API_KEY.value()}`;

    try {
      const res = await fetch(url);
      const geo = (await res.json()) as any;   // res.json() は unknown → any で受ける

      if (geo.status === "OK" && geo.results?.length) {
        const { lat, lng } = geo.results[0].geometry.location;
        await db.doc(snap.ref.path).update({ lat, lng });
        console.log(`位置情報補完: ${lat},${lng}`);
      } else {
        console.error("Geocoding 失敗:", geo.status, data.address);
      }
    } catch (err) {
      console.error("fetch error:", err);
    }
  },
);
