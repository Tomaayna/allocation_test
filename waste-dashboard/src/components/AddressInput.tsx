// components/AddressInput.tsx
import /*React,*/ { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";

interface Props {
  onAdd: (stop: {
    lat: number;
    lng: number;
    address: string;
    client: string;
    time: string;
  }) => void;
}

export default function AddressInput({ onAdd }: Props) {
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [client, setClient] = useState("");

  return (
    <div className="flex gap-2">
      {/* 顧客名入力 */}
      <input
        className="border px-2 py-1 rounded w-40"
        placeholder="顧客名"
        value={client}
        onChange={(e) => setClient(e.target.value)}
      />

      {/* 住所オートコンプリート */}
      <Autocomplete onLoad={setAutocomplete}>
        <input
          className="border px-2 py-1 flex-grow rounded"
          placeholder="住所を入力"
        />
      </Autocomplete>

      <button
        className="bg-blue-600 text-white px-4 rounded"
        onClick={() => {
          if (!autocomplete) return;
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.formatted_address) return;

          const lat = place.geometry.location!.lat();
          const lng = place.geometry.location!.lng();

          onAdd({
            lat,
            lng,
            address: place.formatted_address,
            client: client || place.name || "無名",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
          // 入力クリア
          autocomplete!.getPlace().formatted_address = "";
          setClient("");
        }}
      >
        追加
      </button>
    </div>
  );
}
