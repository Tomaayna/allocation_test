"use client";
import { useMemo, useState, useEffect, useRef } from "react";
//import dayjs from "dayjs";
import type { Stop, StopCsvRow } from "../types";
import Papa from "papaparse";
import type  { ParseResult } from "papaparse";
import { saveAs } from "file-saver";
import RouteMap from "../components/RouteMap";
import { useRouteSettings } from "../hooks/useRouteSettings";


/* ───────────────── UI libs & Icons */
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  MapPin,
  Truck,
  Plus,
  X,
  Trash2,
  RotateCcw,
} from "lucide-react";

/* ───────────────── Firebase */
import {
  collection,
//  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../lib/firebase";

/* ───────────────── hooks & components */
import { useCustomers } from "../hooks/useCustomers";
import type { Customer } from "../types";
import { useVehicles, type Vehicle } from "../hooks/useVehicles";
import { useStaff, type Staff } from "../hooks/useStaff";
import NewCustomerModal from "../components/NewCustomerModal";
import CustomerSelectModal from "../components/CustomerSelectModal";
import ConfirmDelete from "../components/ConfirmDelete";
import clsx from "clsx";
import { format } from "date-fns";

/* -------------------------------------------------------------------------- */
/* Google Map 設定                                                             */
/* -------------------------------------------------------------------------- */
const TOMAKOMAI = { lat: 42.6405, lng: 141.6052 };

/* -------------------------------------------------------------------------- */
/* サマリーカード                                                               */
/* -------------------------------------------------------------------------- */
const SummaryCard = ({ label, value }: { label: string; value: string | number }) => (
  <Card className="flex flex-col justify-center px-4 py-6 text-center">
    <span className="text-3xl font-bold">{value}</span>
    <span className="text-sm text-muted-foreground mt-1">{label}</span>
  </Card>
);

/* 日付抽出ヘルパ */
function extractDateFromFileName(name: string): string | null {
  const m = name.match(/(20\\d{2}-\\d{2}-\\d{2})/); // 2020-12-31 形式
  return m ? m[1] : null;
}

/* ヘルパ: 親ドキュメントを確実に作る */
const ensureRouteDoc = (dateStr: string) =>
  setDoc(
    doc(db, "routes", dateStr),
    { updatedAt: serverTimestamp() },   // 既存があれば merge
    { merge: true },
  );

/* -------------------------------------------------------------------------- */
/* 割当モーダル                                                                */
/* -------------------------------------------------------------------------- */
function AssignModal({
  stop,
  vehicles,
  staff,
  onSave,
  onClose,
}: {
  stop: Stop;
  vehicles: Vehicle[];
  staff: Staff[];
  onSave: (d: { vehicles: string[]; staff: string[]; time: string }) => void;
  onClose: () => void;
}) {
  const [vSel, setVSel] = useState(stop.vehicles);
  const [sSel, setSSel] = useState(stop.staff);
  const [time, setTime] = useState(stop.time ?? "");
  const toggle = (arr: string[], id: string) => (arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[420px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">「{stop.client}」の割当</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <p className="text-sm font-medium mb-1">車両</p>
        {vehicles.map(v => (
          <label key={v.id} className="flex items-center gap-2 mb-1">
            <input type="checkbox" checked={vSel.includes(v.id)} onChange={() => setVSel(toggle(vSel, v.id))} />
            {v.name}
          </label>
        ))}

        <p className="text-sm font-medium mt-4 mb-1">人員</p>
        {staff.map(s => (
          <label key={s.id} className="flex items-center gap-2 mb-1">
            <input type="checkbox" checked={sSel.includes(s.id)} onChange={() => setSSel(toggle(sSel, s.id))} />
            {s.name}
          </label>
        ))}

        <p className="text-sm font-medium mt-4 mb-1">予定時刻</p>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="border rounded px-2 py-1 w-40" />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>キャンセル</Button>
          <Button onClick={() => onSave({ vehicles: vSel, staff: sSel, time })}>保存</Button>
        </div>
      </div>
    </div>
  );
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
  const [stops, setStops] = useState<Stop[]>([]);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [deleting, setDeleting] = useState<Stop | null>(null);

  /* モーダル */
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  /* スタート地点 & ルート生成 */
  const { settings } = useRouteSettings(); 
  const startAddress = settings.startAddress;       // 読み取り専用
  const [startLatLng, setStartLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [generating, setGenerating] = useState(false);

  /* 車両 / スタッフ フィルタ */
  const [queryVehicle, setQueryVehicle] = useState("");
  const [deptVehicle, setDeptVehicle] = useState("");
  const [queryStaff, setQueryStaff] = useState("");
  const [deptStaff, setDeptStaff] = useState("");


  const fileInputRef = useRef<HTMLInputElement>(null);

  /* 部署リスト */
  const departments = useMemo(
    () => Array.from(new Set([...vehicles.map(v => v.department), ...staff.map(s => s.department)])).filter(Boolean),
    [vehicles, staff],
  );

  /* フィルタ後配列 */
  const filteredVehicles = useMemo(
    () => vehicles.filter(v => v.name.includes(queryVehicle) && (deptVehicle ? v.department === deptVehicle : true)),
    [vehicles, queryVehicle, deptVehicle],
  );
  const filteredStaff = useMemo(
    () => staff.filter(s => s.name.includes(queryStaff) && (deptStaff ? s.department === deptStaff : true)),
    [staff, queryStaff, deptStaff],
  );

  /* 名前ヘルパ */
  const vehicleName = (id: string) => vehicles.find(v => v.id === id)?.name ?? id;
  const staffName = (id: string) => staff.find(s => s.id === id)?.name ?? id;

//  const date = dayjs(selectedDate).format("YYYY-MM-DD");

  const downloadCsv = () => {
    const rows = sortedStops.map<StopCsvRow>((s) => ({
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

  const importCsv = (file: File) => {
    Papa.parse<StopCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res: ParseResult<StopCsvRow>) => {
        /* ① 取り込み先日付を決定 */
        const destDate = extractDateFromFileName(file.name) ?? selectedDate;
  
        /* ② 既存 stops 削除（destDate のみ）*/
        const oldSnap = await getDocs(collection(db, "routes", destDate, "stops"));
        const batch   = writeBatch(db);
        oldSnap.forEach((d) =>
          batch.delete(doc(db, "routes", destDate, "stops", d.id)),
        );
  
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
    let unsub = () => {};
    /* ① 親を保証してからリスナを張る */
    ensureRouteDoc(selectedDate).then(() => {
      const q = collection(db, "routes", selectedDate, "stops");
      unsub = onSnapshot(q, snap => {
        const list = snap.docs.map(d => {
          const { id: _unused, ...data } = d.data() as Stop;
          return { ...data, id: d.id };
        });
        setStops(list);
      });
    });
    return () => unsub();
  }, [selectedDate]);
  /* スタート地点ジオコーディング */
  const geocodeStart = async () => {
    const url =
      "https://maps.googleapis.com/maps/api/geocode/json?" +
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
  const haversine = (a: Stop, b: Stop) => {
    if (!a.lat || !a.lng || !b.lat || !b.lng) return 1e9;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const sa =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLng / 2) ** 2 * Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat));
    return 2 * R * Math.asin(Math.sqrt(sa));
  };

  /* ルート生成 */
  const generateRoute = async () => {
    if (stops.length < 2) return;
    setGenerating(true);

    const origin = startLatLng ?? (await geocodeStart());
    if (!origin) { setGenerating(false); return; }

    const timed = stops.filter(s => s.time).sort((a,b) => (a.time ?? "").localeCompare(b.time ?? ""));
    const untimed = stops.filter(s => !s.time);
    const ordered: Stop[] = [...timed];
    let prev = ordered.at(-1) ?? untimed.shift();
    if (prev && !ordered.includes(prev)) ordered.push(prev);
    while (untimed.length) {
      const idx = untimed.reduce((best, s, i) =>
        haversine(prev!, s) < haversine(prev!, untimed[best]) ? i : best, 0);
      const next = untimed.splice(idx,1)[0];
      ordered.push(next);
      prev = next;
    }
    const newList = ordered.map((s,i)=>({ ...s, order: i+1 }));
    setStops(newList);

    const batch = writeBatch(db);
    newList.forEach(s => batch.update(doc(db, "routes", selectedDate, "stops", s.id), { order: s.order }));
    await batch.commit().catch(()=>{});
    setGenerating(false);
  };

  /* 顧客追加 */
  const addCustomerToRoute = async (c: Customer) => {
    await ensureRouteDoc(selectedDate);
    const stopRef = doc(collection(db, "routes", selectedDate, "stops"));
    const newStop: Stop = {
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
    await setDoc(stopRef,{ ...newStop, createdAt: serverTimestamp(),
    });
  };

  /* 保存 / 削除 */
  const saveAssign = async (patch:{vehicles:string[];staff:string[];time:string}) => {
    if (!editingStop) return;
    const id = editingStop.id;
    setStops(prev => prev.map(s => s.id===id ? {...s,...patch} : s));
    await updateDoc(doc(db,"routes",selectedDate,"stops",id),patch);
    setEditingStop(null);
  };
  const removeStop = async (s:Stop)=>{
    setStops(prev=>prev.filter(x=>x.id!==s.id));
    await deleteDoc(doc(db,"routes",selectedDate,"stops",s.id));
  };
  /* order順ソート */
  const sortedStops = [...stops].sort((a,b)=>a.order-b.order);

  /* -------------------------------------------------------------------- */
  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1440px] mx-auto">
      {/* ヘッダ */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">環境保全課 配車ダッシュボード</h1>
        <div className="flex gap-2 items-center">
          <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm" />
          <Button size="sm" onClick={()=>setShowNewModal(true)}>
            <Plus className="w-4 h-4 mr-1"/>新規顧客登録
          </Button>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={downloadCsv}>
              CSV 書き出し
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              CSV 読み込み
            </Button>
            <input
              type="file"
              accept=".csv,text/csv"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importCsv(f);
                e.target.value = "";             // 同じファイル再選択できるようリセット
              }}
            />
          </div>
        </div>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="回収件数" value={stops.length} />
        <SummaryCard label="稼働車両" value={vehicles.filter(v=>v.status==="出庫中").length}/>
        <SummaryCard label="出勤スタッフ" value={staff.filter(s=>s.status==="出勤").length}/>
      </div>

      {/* 3 カラム */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* 左 3 */}
        <div className="xl:col-span-3 flex flex-col gap-6">

          {/* ルート */}
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 flex flex-col gap-2">
                  <Button size="sm" variant="secondary" onClick={()=>setShowSelectModal(true)}>
                    <Plus className="w-4 h-4 mr-1"/>顧客追加
                  </Button>
                <Button size="sm" disabled={generating||stops.length<2} onClick={generateRoute}>
                {generating && <RotateCcw className="w-4 h-4 mr-1 animate-spin"/>}
                ルート生成
              </Button>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
              {sortedStops.map(stop=>(
                <div key={stop.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted">
                  <MapPin className="w-5 h-5 mt-1 shrink-0"/>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      {stop.time && <span className="text-[10px] bg-gray-100 px-1 rounded">{stop.time}</span>}
                      <p className="font-medium">{stop.client}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{stop.address}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {stop.vehicles.map(id=>(
                        <span key={id} className="text-[10px] bg-gray-200 px-1 rounded">{vehicleName(id)}</span>
                      ))}
                      {stop.staff.map(id=>(
                        <span key={id} className="text-[10px] bg-blue-200 px-1 rounded">{staffName(id)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="icon" variant="secondary" onClick={()=>setEditingStop(stop)}><Plus className="w-4 h-4"/></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={()=>setDeleting(stop)}><Trash2 className="w-4 h-4"/></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 車両ステータス */}
          <Card className="overflow-hidden">
            <CardHeader><CardTitle>車両ステータス</CardTitle></CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-3">
                <input className="border rounded px-2 py-1 flex-1" placeholder="名前検索…"
                  value={queryVehicle} onChange={e=>setQueryVehicle(e.target.value)}/>
                <select className="border rounded px-2 py-1 w-full sm:w-36"
                  value={deptVehicle} onChange={e=>setDeptVehicle(e.target.value)}>
                  <option value="">全部署</option>
                  {departments.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {filteredVehicles.map(v=>(
                  <div key={v.id} className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground"/>
                    <span className="flex-1 text-sm">{v.name}</span>
                    <select value={v.status} onChange={e=>updateStatus(v.id, e.target.value as Vehicle["status"])}
                      className={clsx("text-xs px-2 py-0.5 rounded-full border",{
                        "bg-green-100 text-green-700":v.status==="出庫中",
                        "bg-gray-100 text-gray-600":v.status==="入庫中",
                        "bg-yellow-100 text-yellow-700":v.status==="修理・点検",
                      })}>
                      <option>出庫中</option><option>入庫中</option><option>修理・点検</option>
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 中央 6 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
          <Card className="min-h-[350px] w-full">
            <CardHeader><CardTitle>ルートマップ</CardTitle></CardHeader>
            <CardContent className="h-[300px] w-full">
              <RouteMap stops={stops} center={startLatLng ?? TOMAKOMAI}/>
            </CardContent>
          </Card>
        </div>

        {/* 右 3 */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          {/* スタッフ */}
          <Card className="max-h-[350px] overflow-y-auto pr-1">
            <CardHeader>
              <CardTitle>社員出勤状況</CardTitle>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-3">
                <input className="border rounded px-2 py-1 flex-1" placeholder="名前検索…"
                  value={queryStaff} onChange={e=>setQueryStaff(e.target.value)}/>
                <select className="border rounded px-2 py-1 w-full sm:w-36"
                  value={deptStaff} onChange={e=>setDeptStaff(e.target.value)}>
                  <option value="">部署すべて</option>
                  {departments.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredStaff.map(m=>(
                <div key={m.id} className="flex items-start gap-2">
                  <span className="flex-1 text-sm">{m.name}</span>
                  <div className="flex gap-1 flex-wrap max-w-[40%]">
                    {(m.license??[]).map(lic=>(
                      <span key={lic} className="text-[10px] bg-purple-200 px-1 rounded whitespace-nowrap">{lic}</span>
                    ))}
                  </div>
                  <select value={m.status} onChange={e=>updateStaffStatus(m.id,e.target.value as Staff["status"])}
                    className={clsx("text-xs px-2 py-0.5 rounded-full border",{
                      "bg-green-100 text-green-700":m.status==="出勤",
                      "bg-red-100 text-red-700":m.status==="休暇",
                    })}>
                    <option>出勤</option><option>休暇</option>
                  </select>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* モーダル群 */}
      {showSelectModal && (
        <CustomerSelectModal
          customers={customers}
          onSelect={addCustomerToRoute}
          onClose={()=>setShowSelectModal(false)}
        />
      )}
      {showNewModal && <NewCustomerModal onClose={()=>setShowNewModal(false)}/>}
      {editingStop && (
        <AssignModal
          stop={editingStop}
          vehicles={vehicles}
          staff={staff}
          onSave={saveAssign}
          onClose={()=>setEditingStop(null)}
        />
      )}
      {deleting && (
        <ConfirmDelete
          open
          targetName={deleting.client}
          onClose={()=>setDeleting(null)}
          onConfirm={()=>removeStop(deleting)}
        />
      )}
    </div>
  );
}
