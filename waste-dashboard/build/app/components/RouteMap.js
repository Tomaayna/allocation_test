import { jsx as _jsx } from "react/jsx-runtime";
// src/components/RouteMap.tsx など分離推奨
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
const mapStyle = { width: "100%", height: "100%" };
export default function RouteMap({ stops, center, }) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });
    if (!isLoaded)
        return _jsx("div", { className: "flex items-center justify-center h-full", children: "Loading map\u2026" });
    return (_jsx(GoogleMap, { mapContainerStyle: mapStyle, center: center, zoom: 11, children: stops
            .filter((s) => s.lat && s.lng)
            .map((s) => (_jsx(Marker, { position: { lat: s.lat, lng: s.lng } }, s.id))) }));
}
