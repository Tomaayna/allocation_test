import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { X } from "lucide-react";
export default function CustomerSelectModal({ customers, onSelect, onClose, }) {
    /* 検索文字列 */
    const [keyword, setKeyword] = useState("");
    /* 部分一致で絞り込み（大文字小文字を無視） */
    const list = useMemo(() => customers.filter((c) => c.client.toLowerCase().includes(keyword.toLowerCase())), [customers, keyword]);
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl p-6 w-[380px] max-h-[80vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold text-lg", children: "\u9867\u5BA2\u3092\u9078\u629E" }), _jsx("button", { onClick: onClose, children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("input", { className: "border rounded px-2 py-1 w-full mb-3", placeholder: "\u540D\u524D\u691C\u7D22\u2026", value: keyword, onChange: (e) => setKeyword(e.target.value) }), list.map((c) => (_jsxs("button", { className: "w-full text-left px-3 py-2 rounded hover:bg-muted", onClick: () => {
                        onSelect(c);
                        onClose();
                    }, children: [_jsx("p", { className: "font-medium", children: c.client }), _jsx("p", { className: "text-xs text-muted-foreground", children: c.address })] }, c.id))), list.length === 0 && (_jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "\u8A72\u5F53\u3059\u308B\u9867\u5BA2\u304C\u3042\u308A\u307E\u305B\u3093" }))] }) }));
}
