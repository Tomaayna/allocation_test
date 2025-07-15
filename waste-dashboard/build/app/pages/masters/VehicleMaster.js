import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, useRef } from "react";
import { useVehicles } from "../../hooks/useVehicles";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import clsx from "clsx";
import { vehiclesToCsv, importVehiclesCsv } from "../../hooks/useVehicles";
import { saveAs } from "file-saver";
import { toast } from "sonner";
export default function VehicleMaster() {
    const { vehicles, createVehicle, updateVehicle, removeVehicle } = useVehicles();
    const fileRef = useRef(null);
    /* 検索 & フィルタ */
    const [q, setQ] = useState("");
    const [dept, setDept] = useState("");
    const departments = useMemo(() => Array.from(new Set(vehicles.map(v => v.department))).filter(Boolean), [vehicles]);
    const list = useMemo(() => vehicles.filter(v => v.name.includes(q) && (dept ? v.department === dept : true)), [vehicles, q, dept]);
    /* モーダル制御 */
    const [editing, setEditing] = useState(null);
    const [showNew, setShowNew] = useState(false);
    /* CSV 出力 */
    const downloadCsv = () => {
        const blob = vehiclesToCsv(vehicles);
        saveAs(blob, "vehicles.csv");
    };
    /* CSV 取込 */
    const handleCsv = async (f) => {
        try {
            await importVehiclesCsv(f);
            toast.success("CSV を取り込みました");
        }
        catch (e) {
            toast.error(`取込失敗: ${e.message}`);
        }
    };
    return (_jsxs("div", { className: "p-6 flex flex-col gap-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "\u8ECA\u4E21\u30DE\u30B9\u30BF" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { className: "border rounded px-2 py-1 flex-1", placeholder: "\u540D\u524D\u691C\u7D22\u2026", value: q, onChange: e => setQ(e.target.value) }), _jsxs("select", { className: "border rounded px-2 py-1", value: dept, onChange: e => setDept(e.target.value), children: [_jsx("option", { value: "", children: "\u5168\u90E8\u7F72" }), departments.map(d => _jsx("option", { children: d }, d))] }), _jsx(Button, { size: "sm", variant: "outline", onClick: downloadCsv, children: "CSV \u66F8\u304D\u51FA\u3057" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => fileRef.current?.click(), children: "CSV \u8AAD\u307F\u8FBC\u307F" }), _jsx("input", { type: "file", accept: ".csv,text/csv", ref: fileRef, className: "hidden", onChange: (e) => {
                            const f = e.target.files?.[0];
                            if (f)
                                handleCsv(f);
                            e.target.value = ""; // 同じファイル再選択可
                        } }), _jsxs(Button, { size: "sm", onClick: () => setShowNew(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), "\u8FFD\u52A0"] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u767B\u9332\u8ECA\u4E21" }) }), _jsx(CardContent, { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full text-sm", children: [_jsx("thead", { className: "text-left border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "py-1 px-2", children: "\u540D\u524D" }), _jsx("th", { className: "py-1 px-2", children: "\u90E8\u7F72" }), _jsx("th", { className: "py-1 px-2", children: "\u72B6\u614B" }), _jsx("th", { className: "py-1 px-2", children: "\u7A4D\u8F09(t)" }), _jsx("th", { className: "py-1 px-2", children: "\u30CA\u30F3\u30D0\u30FC" }), _jsx("th", {})] }) }), _jsx("tbody", { children: list.map(v => (_jsxs("tr", { className: "border-b hover:bg-muted", children: [_jsx("td", { className: "px-2 py-1", children: v.name }), _jsx("td", { className: "px-2 py-1", children: v.department }), _jsx("td", { className: clsx("px-2 py-1", {
                                                    "text-green-600": v.status === "出庫中",
                                                    "text-gray-600": v.status === "入庫中",
                                                    "text-yellow-600": v.status === "修理・点検",
                                                }), children: v.status }), _jsx("td", { className: "px-2 py-1", children: v.weightLimit ?? "-" }), _jsx("td", { className: "px-2 py-1", children: v.plateNo ?? "-" }), _jsxs("td", { className: "px-2 py-1 flex gap-1", children: [_jsx(Button, { size: "icon", variant: "secondary", onClick: () => setEditing(v), children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { size: "icon", variant: "ghost", className: "text-destructive", onClick: () => removeVehicle(v.id), children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, v.id))) })] }) })] }), (showNew || editing) && (_jsx(VehicleModal, { initial: editing ?? undefined, onSave: async (data) => {
                    editing ? await updateVehicle(editing.id, data)
                        : await createVehicle(data);
                    setEditing(null);
                    setShowNew(false);
                }, onClose: () => { setEditing(null); setShowNew(false); } }))] }));
}
/* モーダル本体 */
function VehicleModal({ initial, onSave, onClose, }) {
    const [form, setForm] = useState({
        name: initial?.name ?? "",
        department: initial?.department ?? "",
        status: initial?.status ?? "入庫中",
        weightLimit: initial?.weightLimit,
        plateNo: initial?.plateNo,
    });
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl p-6 w-[420px]", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: initial ? "車両を編集" : "車両を追加" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "text-sm", children: "\u540D\u524D" }), _jsx("input", { className: "border rounded px-2 py-1 w-full", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }) })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "text-sm", children: "\u90E8\u7F72" }), _jsx("input", { className: "border rounded px-2 py-1 w-full", value: form.department, onChange: e => setForm({ ...form, department: e.target.value }) })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "text-sm", children: "\u72B6\u614B" }), _jsxs("select", { className: "border rounded px-2 py-1 w-full", value: form.status, onChange: e => setForm({ ...form, status: e.target.value }), children: [_jsx("option", { children: "\u51FA\u5EAB\u4E2D" }), _jsx("option", { children: "\u5165\u5EAB\u4E2D" }), _jsx("option", { children: "\u4FEE\u7406\u30FB\u70B9\u691C" })] })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "text-sm", children: "\u7A4D\u8F09\u91CF (t)" }), _jsx("input", { type: "number", className: "border rounded px-2 py-1 w-full", value: form.weightLimit ?? "", onChange: e => setForm({ ...form, weightLimit: Number(e.target.value) || undefined }) })] }), _jsxs("label", { className: "block", children: [_jsx("span", { className: "text-sm", children: "\u30CA\u30F3\u30D0\u30FC" }), _jsx("input", { className: "border rounded px-2 py-1 w-full", value: form.plateNo ?? "", onChange: e => setForm({ ...form, plateNo: e.target.value }) })] })] }), _jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx(Button, { onClick: () => onSave(form), children: "\u4FDD\u5B58" })] })] }) }));
}
