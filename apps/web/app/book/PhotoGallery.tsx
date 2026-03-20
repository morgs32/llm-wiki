"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import Image from "next/image";
import { api } from "@packages/backend/convex/_generated/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const fallbackPhotos = [
  {
    src: "https://picsum.photos/seed/carpark1/800/450",
    alt: "Indoor parking garage with bright LED lighting and marked spots",
  },
  {
    src: "https://picsum.photos/seed/carpark2/800/450",
    alt: "Parking garage entrance with security gate",
  },
  {
    src: "https://picsum.photos/seed/carpark3/800/450",
    alt: "Parking spot level indicator signage",
  },
  {
    src: "https://picsum.photos/seed/carpark4/800/450",
    alt: "Multi-level parking with EV charging stations",
  },
];

export function PhotoGallery({ carparkId }: { carparkId: string | undefined }) {
  const typedCarparkId = useMemo(() => {
    return carparkId ? (carparkId as any) : undefined;
  }, [carparkId]);

  const selectedPlacePhotos = useQuery(
    api.selectedPlacePhotos.listSelectedPlacePhotos,
    typedCarparkId ? { carparkId: typedCarparkId } : "skip",
  );

  const carpark = useQuery(
    api.carparks.getCarpark,
    typedCarparkId ? { carparkId: typedCarparkId } : "skip",
  );

  const [current, setCurrent] = useState(0);

  const photos = useMemo(() => {
    const placeNames = selectedPlacePhotos?.map((p) => p.photoName) ?? [];
    if (placeNames.length > 0) {
      return placeNames.map((photoName) => ({
        src: `/api/places/photo?name=${encodeURIComponent(
          photoName,
        )}&maxHeightPx=900&maxWidthPx=1600`,
        alt: "Carpark photo",
      }));
    }

    const manual = (carpark?.imageUrls ?? []).filter(Boolean);
    if (manual.length > 0) {
      return manual.map((src) => ({ src, alt: "Carpark photo" }));
    }

    return fallbackPhotos;
  }, [carpark?.imageUrls, selectedPlacePhotos]);

  useEffect(() => {
    if (photos.length === 0) return;
    setCurrent((prev) => Math.min(prev, photos.length - 1));
  }, [photos.length]);

  const next = () => setCurrent((prev) => (prev + 1) % photos.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={photos[current]?.src ?? fallbackPhotos[0].src}
          alt={photos[current]?.alt ?? fallbackPhotos[0].alt}
          fill
          className="object-cover transition-all duration-500"
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />

        <button
          onClick={prev}
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-card-foreground backdrop-blur-sm transition-colors hover:bg-card"
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-card-foreground backdrop-blur-sm transition-colors hover:bg-card"
          aria-label="Next photo"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-3 right-3 rounded-full bg-foreground/70 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
          {current + 1} / {photos.length}
        </div>
      </div>
    </div>
  );
}
