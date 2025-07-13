import { useState } from "react";
import { db } from "../lib/firebase";
import { Button } from "./ui/button";
import { createUnique } from "../lib/uniq";          // ← ❶ 一意キーユーティリティ
import { toast } from "sonner";                    // 任意：通知ライブラリ
import { serverTimestamp } from "firebase/firestore";

interface Props {
  onClose: () => void;
}

export default function NewCustomerModal({ onClose }: Props) {
  const [client, setClient] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  /** 入力バリデーション */
  const disabled = !client.trim() || !address.trim() || saving;

  /** 保存処理 */
  const save = async () => {
    if (disabled) return;
    setSaving(true);
    try {
      await createUnique(db, {
        kind: "customers",
        keyParts: [client, address],          // ❷ client+address で一意
        data: {
          client: client.trim(),
          address: address.trim(),
          createdAt: serverTimestamp(),
        },
      });
      toast.success("登録しました");
      onClose();
    } catch (e) {
      if ((e as Error).message === "duplicate") {
        toast.error("同じ顧客がすでに存在します");
      } else {
        toast.error("登録に失敗しました");
        console.error(e);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[380px]">
        <h3 className="font-semibold text-lg mb-4">新規顧客登録</h3>

        <label className="block text-sm mb-1">顧客名</label>
        <input
          className="w-full border rounded px-2 py-1 mb-3"
          value={client}
          onChange={(e) => setClient(e.target.value)}
        />

        <label className="block text-sm mb-1">住所</label>
        <input
          className="w-full border rounded px-2 py-1 mb-4"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button disabled={disabled} onClick={save}>
            {saving ? "登録中…" : "登録"}
          </Button>
        </div>
      </div>
    </div>
  );
}
