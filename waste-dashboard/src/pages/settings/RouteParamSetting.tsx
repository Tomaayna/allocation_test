import { useEffect, useState } from "react";
import { useRouteSettings } from "../../hooks/useRouteSettings";
import { Button } from "../../components/ui/button";

export default function RouteParamSetting() {
  const { settings, save, loading } = useRouteSettings();
  const [addr, setAddr] = useState("");
  const [saving, setSaving] = useState(false);

  /* Firestore から値が来たら同期 */
  useEffect(() => {
    setAddr(settings.startAddress ?? "");
  }, [settings.startAddress]);

  if (loading) return <p>Loading…</p>;

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold">ルート生成パラメータ</h2>

      <label className="block text-sm font-medium">
        スタート地点（住所）
        <input
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          className="mt-1 w-full border rounded px-2 py-1"
        />
      </label>

      <Button
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          await save({ startAddress: addr });
          setSaving(false);
        }}
      >
        {saving ? "保存中…" : "保存"}
      </Button>
    </div>
  );
}
