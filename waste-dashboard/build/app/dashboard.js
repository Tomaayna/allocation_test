"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
/* ───────────────── UI libs & Icons */
import { Card, CardHeader, CardTitle, CardContent, } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { MapPin, Truck, Plus, X, Trash2, RotateCcw, } from "lucide-react";
/* ───────────────── Google Map */
import { GoogleMap, LoadScript, Marker, } from "@react-google-maps/api";
/* ───────────────── Firebase */
import { collection, 
//  addDoc,
doc, updateDoc, deleteDoc, serverTimestamp, writeBatch, onSnapshot, setDoc, getDocs, } from "firebase/firestore";
import { db } from "./lib/firebase";
/* ───────────────── hooks & components */
import { useCustomers } from "./hooks/useCustomers";
import { useVehicles } from "./hooks/useVehicles";
import { useStaff } from "./hooks/useStaff";
import NewCustomerModal from "./components/NewCustomerModal";
import CustomerSelectModal from "./components/CustomerSelectModal";
import ConfirmDelete from "./components/ConfirmDelete";
import clsx from "clsx";
import { format } from "date-fns";
/* -------------------------------------------------------------------------- */
/* Google Map 設定                                                             */
/* -------------------------------------------------------------------------- */
const mapStyle = { width: "100%", height: "100%" };
const TOMAKOMAI = { lat: 42.6405, lng: 141.6052 };
/* 地図描画 */
function RouteMap({ stops, center }) {
    return (_jsx(LoadScript, { googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "", children: _jsx(GoogleMap, { mapContainerStyle: mapStyle, center: center, zoom: 11, children: stops.filter(s => s.lat && s.lng).map(s => (_jsx(Marker, { position: { lat: s.lat, lng: s.lng } }, s.id))) }) }));
}
/* -------------------------------------------------------------------------- */
/* サマリーカード                                                               */
/* -------------------------------------------------------------------------- */
const SummaryCard = ({ label, value }) => (_jsxs(Card, { className: "flex flex-col justify-center px-4 py-6 text-center", children: [_jsx("span", { className: "text-3xl font-bold", children: value }), _jsx("span", { className: "text-sm text-muted-foreground mt-1", children: label })] }));
/* 日付抽出ヘルパ */
function extractDateFromFileName(name) {
    const m = name.match(/(20\\d{2}-\\d{2}-\\d{2})/); // 2020-12-31 形式
    return m ? m[1] : null;
}
/* ヘルパ: 親ドキュメントを確実に作る */
const ensureRouteDoc = (dateStr) => setDoc(doc(db, "routes", dateStr), { updatedAt: serverTimestamp() }, // 既存があれば merge
{ merge: true });
/* -------------------------------------------------------------------------- */
/* 割当モーダル                                                                */
/* -------------------------------------------------------------------------- */
function AssignModal({ stop, vehicles, staff, onSave, onClose, }) {
    const [vSel, setVSel] = useState(stop.vehicles);
    const [sSel, setSSel] = useState(stop.staff);
    const [time, setTime] = useState(stop.time ?? "");
    const toggle = (arr, id) => (arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-xl p-6 w-[420px] max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h3", { className: "font-semibold text-lg", children: ["\u300C", stop.client, "\u300D\u306E\u5272\u5F53"] }), _jsx("button", { onClick: onClose, children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("p", { className: "text-sm font-medium mb-1", children: "\u8ECA\u4E21" }), vehicles.map(v => (_jsxs("label", { className: "flex items-center gap-2 mb-1", children: [_jsx("input", { type: "checkbox", checked: vSel.includes(v.id), onChange: () => setVSel(toggle(vSel, v.id)) }), v.name] }, v.id))), _jsx("p", { className: "text-sm font-medium mt-4 mb-1", children: "\u4EBA\u54E1" }), staff.map(s => (_jsxs("label", { className: "flex items-center gap-2 mb-1", children: [_jsx("input", { type: "checkbox", checked: sSel.includes(s.id), onChange: () => setSSel(toggle(sSel, s.id)) }), s.name] }, s.id))), _jsx("p", { className: "text-sm font-medium mt-4 mb-1", children: "\u4E88\u5B9A\u6642\u523B" }), _jsx("input", { type: "time", value: time, onChange: e => setTime(e.target.value), className: "border rounded px-2 py-1 w-40" }), _jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx(Button, { onClick: () => onSave({ vehicles: vSel, staff: sSel, time }), children: "\u4FDD\u5B58" })] })] }) }));
}
/* -------------------------------------------------------------------------- */
/* メインコンポーネント                                                         */
/* -------------------------------------------------------------------------- */
export default function WasteCollectionDashboard() {
    /* Firestore 購読 */
    const customers = useCustomers();
    const { vehicles, updateStatus } = useVehicles();
    const { staff, updateStatus: updateStaffStatus } = useStaff();
    /* 日付切替 */
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const [selectedDate, setSelectedDate] = useState(todayStr);
    /* ルート */
    //const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [stops, setStops] = useState([]);
    const [editingStop, setEditingStop] = useState(null);
    const [deleting, setDeleting] = useState(null);
    /* モーダル */
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    /* スタート地点 & ルート生成 */
    const [startAddress, setStartAddress] = useState("北海道苫小牧市柳町2-2-8");
    const [startLatLng, setStartLatLng] = useState(null);
    const [generating, setGenerating] = useState(false);
    /* 車両 / スタッフ フィルタ */
    const [queryVehicle, setQueryVehicle] = useState("");
    const [deptVehicle, setDeptVehicle] = useState("");
    const [queryStaff, setQueryStaff] = useState("");
    const [deptStaff, setDeptStaff] = useState("");
    const fileInputRef = useRef(null);
    /* 部署リスト */
    const departments = useMemo(() => Array.from(new Set([...vehicles.map(v => v.department), ...staff.map(s => s.department)])).filter(Boolean), [vehicles, staff]);
    /* フィルタ後配列 */
    const filteredVehicles = useMemo(() => vehicles.filter(v => v.name.includes(queryVehicle) && (deptVehicle ? v.department === deptVehicle : true)), [vehicles, queryVehicle, deptVehicle]);
    const filteredStaff = useMemo(() => staff.filter(s => s.name.includes(queryStaff) && (deptStaff ? s.department === deptStaff : true)), [staff, queryStaff, deptStaff]);
    /* 名前ヘルパ */
    const vehicleName = (id) => vehicles.find(v => v.id === id)?.name ?? id;
    const staffName = (id) => staff.find(s => s.id === id)?.name ?? id;
    //  const date = dayjs(selectedDate).format("YYYY-MM-DD");
    const downloadCsv = () => {
        const rows = sortedStops.map((s) => ({
            order: s.order,
            client: s.client,
            address: s.address,
            time: s.time ?? "",
            lat: s.lat ?? "",
            lng: s.lng ?? "",
            vehicleIds: s.vehicles.join("|"),
            staffIds: s.staff.join("|"),
        }));
        const csv = Papa.unparse(rows, { quotes: false, skipEmptyLines: true });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `route_${selectedDate}.csv`);
    };
    const importCsv = (file) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (res) => {
                /* ① 取り込み先日付を決定 */
                const destDate = extractDateFromFileName(file.name) ?? selectedDate;
                /* ② 既存 stops 削除（destDate のみ）*/
                const oldSnap = await getDocs(collection(db, "routes", destDate, "stops"));
                const batch = writeBatch(db);
                oldSnap.forEach((d) => batch.delete(doc(db, "routes", destDate, "stops", d.id)));
                /* ③ CSV 行を追加 */
                await ensureRouteDoc(destDate);
                res.data.forEach((r, idx) => {
                    const ref = doc(collection(db, "routes", destDate, "stops"));
                    batch.set(ref, {
                        id: ref.id,
                        customerId: "",
                        client: r.client,
                        address: r.address,
                        lat: r.lat ? Number(r.lat) : undefined,
                        lng: r.lng ? Number(r.lng) : undefined,
                        order: idx + 1,
                        time: r.time || undefined,
                        vehicles: r.vehicleIds ? r.vehicleIds.split("|") : [],
                        staff: r.staffIds ? r.staffIds.split("|") : [],
                        createdAt: serverTimestamp(),
                    });
                });
                await batch.commit();
                /* ④ UI でその日付を自動表示に切替 */
                setSelectedDate(destDate);
            },
        });
    };
    /* ───────── Firestore 購読 */
    useEffect(() => {
        let unsub = () => { };
        /* ① 親を保証してからリスナを張る */
        ensureRouteDoc(selectedDate).then(() => {
            const q = collection(db, "routes", selectedDate, "stops");
            unsub = onSnapshot(q, snap => {
                const list = snap.docs.map(d => {
                    const { id: _unused, ...data } = d.data();
                    return { ...data, id: d.id };
                });
                setStops(list);
            });
        });
        return () => unsub();
    }, [selectedDate]);
    /* スタート地点ジオコーディング */
    const geocodeStart = async () => {
        const url = "https://maps.googleapis.com/maps/api/geocode/json?" +
            `address=${encodeURIComponent(startAddress)}` +
            `&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const j = await res.json();
        if (j.status === "OK") {
            const loc = j.results[0].geometry.location;
            setStartLatLng(loc);
            return loc;
        }
        alert("スタート地点が見つかりません");
        return null;
    };
    /* 距離計算 */
    const haversine = (a, b) => {
        if (!a.lat || !a.lng || !b.lat || !b.lng)
            return 1e9;
        const toRad = (d) => (d * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(b.lat - a.lat);
        const dLng = toRad(b.lng - a.lng);
        const sa = Math.sin(dLat / 2) ** 2 +
            Math.sin(dLng / 2) ** 2 * Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat));
        return 2 * R * Math.asin(Math.sqrt(sa));
    };
    /* ルート生成 */
    const generateRoute = async () => {
        if (stops.length < 2)
            return;
        setGenerating(true);
        const origin = startLatLng ?? (await geocodeStart());
        if (!origin) {
            setGenerating(false);
            return;
        }
        const timed = stops.filter(s => s.time).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
        const untimed = stops.filter(s => !s.time);
        const ordered = [...timed];
        let prev = ordered.at(-1) ?? untimed.shift();
        if (prev && !ordered.includes(prev))
            ordered.push(prev);
        while (untimed.length) {
            const idx = untimed.reduce((best, s, i) => haversine(prev, s) < haversine(prev, untimed[best]) ? i : best, 0);
            const next = untimed.splice(idx, 1)[0];
            ordered.push(next);
            prev = next;
        }
        const newList = ordered.map((s, i) => ({ ...s, order: i + 1 }));
        setStops(newList);
        const batch = writeBatch(db);
        newList.forEach(s => batch.update(doc(db, "routes", selectedDate, "stops", s.id), { order: s.order }));
        await batch.commit().catch(() => { });
        setGenerating(false);
    };
    /* 顧客追加 */
    const addCustomerToRoute = async (c) => {
        await ensureRouteDoc(selectedDate);
        const stopRef = doc(collection(db, "routes", selectedDate, "stops"));
        const newStop = {
            id: stopRef.id,
            customerId: c.id,
            client: c.client,
            address: c.address,
            lat: c.lat,
            lng: c.lng,
            order: stops.length + 1,
            time: undefined,
            vehicles: [],
            staff: [],
        };
        setStops(prev => [...prev, newStop]);
        await setDoc(stopRef, { ...newStop, createdAt: serverTimestamp(),
        });
    };
    /* 保存 / 削除 */
    const saveAssign = async (patch) => {
        if (!editingStop)
            return;
        const id = editingStop.id;
        setStops(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
        await updateDoc(doc(db, "routes", selectedDate, "stops", id), patch);
        setEditingStop(null);
    };
    const removeStop = async (s) => {
        setStops(prev => prev.filter(x => x.id !== s.id));
        await deleteDoc(doc(db, "routes", selectedDate, "stops", s.id));
    };
    /* order順ソート */
    const sortedStops = [...stops].sort((a, b) => a.order - b.order);
    /* -------------------------------------------------------------------- */
    return (_jsxs("div", { className: "flex flex-col gap-8 p-8 max-w-[1440px] mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4", children: [_jsx("h1", { className: "text-3xl font-bold", children: "\u74B0\u5883\u4FDD\u5168\u8AB2 \u914D\u8ECA\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("input", { type: "date", value: selectedDate, onChange: e => setSelectedDate(e.target.value), className: "border rounded px-2 py-1 text-sm" }), _jsxs(Button, { size: "sm", onClick: () => setShowNewModal(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), "\u65B0\u898F\u9867\u5BA2\u767B\u9332"] }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: downloadCsv, children: "CSV \u66F8\u304D\u51FA\u3057" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => fileInputRef.current?.click(), children: "CSV \u8AAD\u307F\u8FBC\u307F" }), _jsx("input", { type: "file", accept: ".csv,text/csv", ref: fileInputRef, className: "hidden", onChange: (e) => {
                                            const f = e.target.files?.[0];
                                            if (f)
                                                importCsv(f);
                                            e.target.value = ""; // 同じファイル再選択できるようリセット
                                        } })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(SummaryCard, { label: "\u56DE\u53CE\u4EF6\u6570", value: stops.length }), _jsx(SummaryCard, { label: "\u7A3C\u50CD\u8ECA\u4E21", value: vehicles.filter(v => v.status === "出庫中").length }), _jsx(SummaryCard, { label: "\u51FA\u52E4\u30B9\u30BF\u30C3\u30D5", value: staff.filter(s => s.status === "出勤").length })] }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-12 gap-6", children: [_jsxs("div", { className: "xl:col-span-3 flex flex-col gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: _jsxs("div", { className: "flex-1 flex flex-col gap-2", children: [_jsx("input", { className: "border rounded px-2 py-1 text-sm w-full", value: startAddress, onChange: e => setStartAddress(e.target.value), placeholder: "\u30B9\u30BF\u30FC\u30C8\u5730\u70B9\u2026" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: "secondary", onClick: geocodeStart, children: "\u4F4D\u7F6E\u66F4\u65B0" }), _jsxs(Button, { size: "sm", variant: "secondary", onClick: () => setShowSelectModal(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), "\u9867\u5BA2\u8FFD\u52A0"] })] }), _jsxs(Button, { size: "sm", disabled: generating || stops.length < 2, onClick: generateRoute, children: [generating && _jsx(RotateCcw, { className: "w-4 h-4 mr-1 animate-spin" }), "\u30EB\u30FC\u30C8\u751F\u6210"] })] }) }), _jsx(CardContent, { className: "flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1", children: sortedStops.map(stop => (_jsxs("div", { className: "flex items-start gap-2 p-2 rounded-lg hover:bg-muted", children: [_jsx(MapPin, { className: "w-5 h-5 mt-1 shrink-0" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-1", children: [stop.time && _jsx("span", { className: "text-[10px] bg-gray-100 px-1 rounded", children: stop.time }), _jsx("p", { className: "font-medium", children: stop.client })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: stop.address }), _jsxs("div", { className: "flex gap-1 mt-1 flex-wrap", children: [stop.vehicles.map(id => (_jsx("span", { className: "text-[10px] bg-gray-200 px-1 rounded", children: vehicleName(id) }, id))), stop.staff.map(id => (_jsx("span", { className: "text-[10px] bg-blue-200 px-1 rounded", children: staffName(id) }, id)))] })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx(Button, { size: "icon", variant: "secondary", onClick: () => setEditingStop(stop), children: _jsx(Plus, { className: "w-4 h-4" }) }), _jsx(Button, { size: "icon", variant: "ghost", className: "text-destructive", onClick: () => setDeleting(stop), children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, stop.id))) })] }), _jsxs(Card, { className: "overflow-hidden", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u8ECA\u4E21\u30B9\u30C6\u30FC\u30BF\u30B9" }) }), _jsxs(CardContent, { className: "pt-2", children: [_jsxs("div", { className: "flex flex-col sm:flex-row flex-wrap gap-2 mb-3", children: [_jsx("input", { className: "border rounded px-2 py-1 flex-1", placeholder: "\u540D\u524D\u691C\u7D22\u2026", value: queryVehicle, onChange: e => setQueryVehicle(e.target.value) }), _jsxs("select", { className: "border rounded px-2 py-1 w-full sm:w-36", value: deptVehicle, onChange: e => setDeptVehicle(e.target.value), children: [_jsx("option", { value: "", children: "\u5168\u90E8\u7F72" }), departments.map(d => _jsx("option", { children: d }, d))] })] }), _jsx("div", { className: "space-y-2 max-h-[260px] overflow-y-auto pr-1", children: filteredVehicles.map(v => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Truck, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "flex-1 text-sm", children: v.name }), _jsxs("select", { value: v.status, onChange: e => updateStatus(v.id, e.target.value), className: clsx("text-xs px-2 py-0.5 rounded-full border", {
                                                                "bg-green-100 text-green-700": v.status === "出庫中",
                                                                "bg-gray-100 text-gray-600": v.status === "入庫中",
                                                                "bg-yellow-100 text-yellow-700": v.status === "修理・点検",
                                                            }), children: [_jsx("option", { children: "\u51FA\u5EAB\u4E2D" }), _jsx("option", { children: "\u5165\u5EAB\u4E2D" }), _jsx("option", { children: "\u4FEE\u7406\u30FB\u70B9\u691C" })] })] }, v.id))) })] })] })] }), _jsx("div", { className: "xl:col-span-6 flex flex-col gap-6", children: _jsxs(Card, { className: "min-h-[350px] w-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u30EB\u30FC\u30C8\u30DE\u30C3\u30D7" }) }), _jsx(CardContent, { className: "h-[300px] w-full", children: _jsx(RouteMap, { stops: stops, center: startLatLng ?? TOMAKOMAI }) })] }) }), _jsx("div", { className: "xl:col-span-3 flex flex-col gap-6", children: _jsxs(Card, { className: "max-h-[350px] overflow-y-auto pr-1", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "\u30B9\u30BF\u30C3\u30D5\u51FA\u52E4\u72B6\u6CC1" }), _jsxs("div", { className: "flex flex-col sm:flex-row flex-wrap gap-2 mt-3", children: [_jsx("input", { className: "border rounded px-2 py-1 flex-1", placeholder: "\u540D\u524D\u691C\u7D22\u2026", value: queryStaff, onChange: e => setQueryStaff(e.target.value) }), _jsxs("select", { className: "border rounded px-2 py-1 w-full sm:w-36", value: deptStaff, onChange: e => setDeptStaff(e.target.value), children: [_jsx("option", { value: "", children: "\u90E8\u7F72\u3059\u3079\u3066" }), departments.map(d => _jsx("option", { children: d }, d))] })] })] }), _jsx(CardContent, { className: "space-y-2", children: filteredStaff.map(m => (_jsxs("div", { className: "flex items-start gap-2", children: [_jsx("span", { className: "flex-1 text-sm", children: m.name }), _jsx("div", { className: "flex gap-1 flex-wrap max-w-[40%]", children: (m.license ?? []).map(lic => (_jsx("span", { className: "text-[10px] bg-purple-200 px-1 rounded whitespace-nowrap", children: lic }, lic))) }), _jsxs("select", { value: m.status, onChange: e => updateStaffStatus(m.id, e.target.value), className: clsx("text-xs px-2 py-0.5 rounded-full border", {
                                                    "bg-green-100 text-green-700": m.status === "出勤",
                                                    "bg-red-100 text-red-700": m.status === "休暇",
                                                }), children: [_jsx("option", { children: "\u51FA\u52E4" }), _jsx("option", { children: "\u4F11\u6687" })] })] }, m.id))) })] }) })] }), showSelectModal && (_jsx(CustomerSelectModal, { customers: customers, onSelect: addCustomerToRoute, onClose: () => setShowSelectModal(false) })), showNewModal && _jsx(NewCustomerModal, { onClose: () => setShowNewModal(false) }), editingStop && (_jsx(AssignModal, { stop: editingStop, vehicles: vehicles, staff: staff, onSave: saveAssign, onClose: () => setEditingStop(null) })), deleting && (_jsx(ConfirmDelete, { open: true, targetName: deleting.client, onClose: () => setDeleting(null), onConfirm: () => removeStop(deleting) }))] }));
}
