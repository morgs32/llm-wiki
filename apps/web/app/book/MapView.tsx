"use client";

import { CarparkMap, type MapMarker } from "@/app/book/CarparkMap";
import { useBookSearch } from "@/app/book/BookSearchContext";
import { useRouter } from "next/navigation";

export function MapView() {
  const { markers } = useBookSearch();
  const router = useRouter();
  const mapMarkers: MapMarker[] = markers.map((m) => ({
    id: m.id,
    name: m.name,
    rating: m.rating,
    lng: m.lng,
    lat: m.lat,
    count: m.count,
  }));
  return (
    <CarparkMap
      markers={mapMarkers}
      className="h-full w-full"
      onMarkerClick={(markerId) => router.push(`/book/${markerId}`)}
    />
  );
}
