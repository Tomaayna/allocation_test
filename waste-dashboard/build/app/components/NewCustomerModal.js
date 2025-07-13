import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { db } from "../lib/firebase";
import { Button } from "./ui/button";
import { createUnique } from "../lib/uniq"; // ← ❶ 一意キーユーティリティ
import { toast } from "sonner"; // 任意：通知ライブラリ
import { serverTimestamp } from "firebase/firestore";
export default function NewCustomerModal({ onClose }) {
    const [client, setClient] = useState("");
    const [address, setAddress] = useState("");
    const [saving, setSaving] = useState(false);
    /** 入力バリデーション */
    const disabled = !client.trim() || !address.trim() || saving;
    /** 保存処理 */
    const save = async () => {
        if (disabled)
            return;
        setSaving(true);
        try {
            await createUnique(db, {
                kind: "customers",
                keyParts: [client, address], // ❷ client+address で一意
                data: {
                    client: client.trim(),
                    address: address.trim(),
                    createdAt: serverTimestamp(),
                },
            });
            toast.success("登録しました");
            onClose();
        }
        catch (e) {
            if (e.message === "duplicate") {
                toast.error("同じ顧客がすでに存在します");
            }
            else {
                toast.error("登録に失敗しました");
                console.error(e);
            }
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl p-6 w-[380px]", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "\u65B0\u898F\u9867\u5BA2\u767B\u9332" }), _jsx("label", { className: "block text-sm mb-1", children: "\u9867\u5BA2\u540D" }), _jsx("input", { className: "w-full border rounded px-2 py-1 mb-3", value: client, onChange: (e) => setClient(e.target.value) }), _jsx("label", { className: "block text-sm mb-1", children: "\u4F4F\u6240" }), _jsx("input", { className: "w-full border rounded px-2 py-1 mb-4", value: address, onChange: (e) => setAddress(e.target.value) }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx(Button, { disabled: disabled, onClick: save, children: saving ? "登録中…" : "登録" })] })] }) }));
}
