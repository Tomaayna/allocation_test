//import React from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";

interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  center: LatLng;
  zoom?: number;
  stops: LatLng[];
}

export default function MapView({ center, zoom = 12, stops }: Props) {
  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={zoom}
      >
        {stops.map((p, i) => (
          <Marker key={i} position={p} />
        ))}
        <Polyline path={stops} options={{ strokeWeight: 3 }} />
      </GoogleMap>
    </LoadScript>
  );
}
