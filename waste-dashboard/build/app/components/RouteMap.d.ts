import type { Stop } from "../types";
export default function RouteMap({ stops, center, }: {
    stops: Stop[];
    center: {
        lat: number;
        lng: number;
    };
}): import("react/jsx-runtime").JSX.Element;
