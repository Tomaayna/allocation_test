// src/components/RouteMap.tsx など分離推奨
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import type { Stop } from "../types";

const mapStyle = { width: "100%", height: "100%" };

export default function RouteMap({
  stops,
  center,
}: {
  stops: Stop[];
  center: { lat: number; lng: number };
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  if (!isLoaded) return <div className="flex items-center justify-center h-full">Loading map…</div>;

  return (
    <GoogleMap mapContainerStyle={mapStyle} center={center} zoom={11}>
      {stops
        .filter((s) => s.lat && s.lng)
        .map((s) => (
          <Marker key={s.id} position={{ lat: s.lat!, lng: s.lng! }} />
        ))}
    </GoogleMap>
  );
}
