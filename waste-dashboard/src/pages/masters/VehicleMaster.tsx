import { useMemo, useState,useRef } from "react";
import { useVehicles, type Vehicle } from "../../hooks/useVehicles";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import clsx from "clsx";
import { vehiclesToCsv, importVehiclesCsv } from "../../hooks/useVehicles";
import { saveAs } from "file-saver";
import { toast } from "sonner";

export default function VehicleMaster() {
  const { vehicles, createVehicle, updateVehicle, removeVehicle } = useVehicles();

  const fileRef = useRef<HTMLInputElement>(null);

  /* 検索 & フィルタ */
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");

  const departments = useMemo(
    () => Array.from(new Set(vehicles.map(v => v.department))).filter(Boolean),
    [vehicles],
  );

  const list = useMemo(
    () => vehicles.filter(v =>
      v.name.includes(q) && (dept ? v.department === dept : true)
    ),
    [vehicles, q, dept],
  );

  /* モーダル制御 */
  const [editing, setEditing] = useState<Vehicle|null>(null);
  const [showNew, setShowNew] = useState(false);

  /* CSV 出力 */
  const downloadCsv = () => {
    const blob = vehiclesToCsv(vehicles);
    saveAs(blob, "vehicles.csv");
  };

  /* CSV 取込 */
  const handleCsv = async (f: File) => {
    try {
      await importVehiclesCsv(f);
      toast.success("CSV を取り込みました");
    } catch (e: any) {
      toast.error(`取込失敗: ${e.message}`);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">車両マスタ</h1>

      <div className="flex items-center gap-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          placeholder="名前検索…"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <select
          className="border rounded px-2 py-1"
          value={dept}
          onChange={e=>setDept(e.target.value)}
        >
          <option value="">全部署</option>
          {departments.map(d=><option key={d}>{d}</option>)}
        </select>
        <Button size="sm" variant="outline" onClick={downloadCsv}>
          CSV 書き出し
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
        >
          CSV 読み込み
        </Button>
        <input
          type="file"
          accept=".csv,text/csv"
          ref={fileRef}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleCsv(f);
            e.target.value = ""; // 同じファイル再選択可
          }}
        />
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="w-4 h-4 mr-1" />
          追加
        </Button>
      </div>

      {/* 一覧 */}
      <Card>
        <CardHeader><CardTitle>登録車両</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left border-b">
              <tr>
                <th className="py-1 px-2">名前</th>
                <th className="py-1 px-2">部署</th>
                <th className="py-1 px-2">状態</th>
                <th className="py-1 px-2">積載(t)</th>
                <th className="py-1 px-2">ナンバー</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map(v=>(
                <tr key={v.id} className="border-b hover:bg-muted">
                  <td className="px-2 py-1">{v.name}</td>
                  <td className="px-2 py-1">{v.department}</td>
                  <td className={clsx("px-2 py-1",{
                    "text-green-600": v.status==="出庫中",
                    "text-gray-600":  v.status==="入庫中",
                    "text-yellow-600":v.status==="修理・点検",
                  })}>{v.status}</td>
                  <td className="px-2 py-1">{v.weightLimit ?? "-"}</td>
                  <td className="px-2 py-1">{v.plateNo ?? "-"}</td>
                  <td className="px-2 py-1 flex gap-1">
                    <Button size="icon" variant="secondary" onClick={()=>setEditing(v)}>
                      <Edit className="w-4 h-4"/>
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={()=>removeVehicle(v.id)}>
                      <Trash2 className="w-4 h-4"/>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 追加・編集モーダル */}
      {(showNew || editing) && (
        <VehicleModal
          initial={editing ?? undefined}
          onSave={async (data)=>{
            editing ? await updateVehicle(editing.id,data)
                    : await createVehicle(data);
            setEditing(null); setShowNew(false);
          }}
          onClose={()=>{ setEditing(null); setShowNew(false); }}
        />
      )}
    </div>
  );
}

/* モーダル本体 */
function VehicleModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Vehicle;
  onSave: (data: Omit<Vehicle,"id">)=>Promise<void>;
  onClose: ()=>void;
}) {
  const [form,setForm] = useState<Omit<Vehicle,"id">>({
    name: initial?.name ?? "",
    department: initial?.department ?? "",
    status: initial?.status ?? "入庫中",
    weightLimit: initial?.weightLimit,
    plateNo: initial?.plateNo,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[420px]">
        <h3 className="font-semibold text-lg mb-4">
          {initial ? "車両を編集" : "車両を追加"}
        </h3>

        {/* フォーム */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm">名前</span>
            <input className="border rounded px-2 py-1 w-full"
              value={form.name}
              onChange={e=>setForm({...form,name:e.target.value})}/>
          </label>

          <label className="block">
            <span className="text-sm">部署</span>
            <input className="border rounded px-2 py-1 w-full"
              value={form.department}
              onChange={e=>setForm({...form,department:e.target.value})}/>
          </label>

          <label className="block">
            <span className="text-sm">状態</span>
            <select className="border rounded px-2 py-1 w-full"
              value={form.status}
              onChange={e=>setForm({...form,status:e.target.value as Vehicle["status"]})}>
              <option>出庫中</option><option>入庫中</option><option>修理・点検</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm">積載量 (t)</span>
            <input type="number" className="border rounded px-2 py-1 w-full"
              value={form.weightLimit ?? ""}
              onChange={e=>setForm({...form,weightLimit:Number(e.target.value)||undefined})}/>
          </label>

          <label className="block">
            <span className="text-sm">ナンバー</span>
            <input className="border rounded px-2 py-1 w-full"
              value={form.plateNo ?? ""}
              onChange={e=>setForm({...form,plateNo:e.target.value})}/>
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>キャンセル</Button>
          <Button onClick={()=>onSave(form)}>保存</Button>
        </div>
      </div>
    </div>
  );
}
