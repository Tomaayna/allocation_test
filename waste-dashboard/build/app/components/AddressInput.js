import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// components/AddressInput.tsx
import /*React,*/ { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
export default function AddressInput({ onAdd }) {
    const [autocomplete, setAutocomplete] = useState(null);
    const [client, setClient] = useState("");
    return (_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "border px-2 py-1 rounded w-40", placeholder: "\u9867\u5BA2\u540D", value: client, onChange: (e) => setClient(e.target.value) }), _jsx(Autocomplete, { onLoad: setAutocomplete, children: _jsx("input", { className: "border px-2 py-1 flex-grow rounded", placeholder: "\u4F4F\u6240\u3092\u5165\u529B" }) }), _jsx("button", { className: "bg-blue-600 text-white px-4 rounded", onClick: () => {
                    if (!autocomplete)
                        return;
                    const place = autocomplete.getPlace();
                    if (!place.geometry || !place.formatted_address)
                        return;
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    onAdd({
                        lat,
                        lng,
                        address: place.formatted_address,
                        client: client || place.name || "無名",
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    });
                    // 入力クリア
                    autocomplete.getPlace().formatted_address = "";
                    setClient("");
                }, children: "\u8FFD\u52A0" })] }));
}
