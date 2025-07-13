import { useState, useMemo } from "react";
import { X } from "lucide-react";
import type { Customer } from "../types";

interface Props {
  customers: Customer[];
  onSelect: (c: Customer) => void;
  onClose: () => void;
}

export default function CustomerSelectModal({
  customers,
  onSelect,
  onClose,
}: Props) {
  /* 検索文字列 */
  const [keyword, setKeyword] = useState("");

  /* 部分一致で絞り込み（大文字小文字を無視） */
  const list = useMemo(
    () =>
      customers.filter((c) =>
        c.client.toLowerCase().includes(keyword.toLowerCase()),
      ),
    [customers, keyword],
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[380px] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">顧客を選択</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ▼ 名前検索ボックス */}
        <input
          className="border rounded px-2 py-1 w-full mb-3"
          placeholder="名前検索…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        {list.map((c) => (
          <button
            key={c.id}
            className="w-full text-left px-3 py-2 rounded hover:bg-muted"
            onClick={() => {
              onSelect(c);
              onClose();
            }}
          >
            <p className="font-medium">{c.client}</p>
            <p className="text-xs text-muted-foreground">{c.address}</p>
          </button>
        ))}

        {list.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            該当する顧客がありません
          </p>
        )}
      </div>
    </div>
  );
}
