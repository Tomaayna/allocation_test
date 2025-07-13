import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
//import React from "react";
import { GoogleMap, LoadScript, Marker, Polyline, } from "@react-google-maps/api";
export default function MapView({ center, zoom = 12, stops }) {
    return (_jsx(LoadScript, { googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, children: _jsxs(GoogleMap, { mapContainerStyle: { width: "100%", height: "100%" }, center: center, zoom: zoom, children: [stops.map((p, i) => (_jsx(Marker, { position: p }, i))), _jsx(Polyline, { path: stops, options: { strokeWeight: 3 } })] }) }));
}
