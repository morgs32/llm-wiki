"use client";

import { CarparkMap, type MapMarker } from "@/app/book/CarparkMap";
import { useBookSearch } from "@/app/book/BookSearchContext";

export function MapView() {
  const { markers } = useBookSearch();
  const mapMarkers: MapMarker[] = markers.map((m) => ({
    id: m.id,
    name: m.name,
    rating: m.rating,
    lng: m.lng,
    lat: m.lat,
    count: m.count,
  }));
  return <CarparkMap markers={mapMarkers} className="h-full w-full" />;
}
