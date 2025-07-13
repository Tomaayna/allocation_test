interface LatLng {
    lat: number;
    lng: number;
}
interface Props {
    center: LatLng;
    zoom?: number;
    stops: LatLng[];
}
export default function MapView({ center, zoom, stops }: Props): import("react/jsx-runtime").JSX.Element;
export {};
