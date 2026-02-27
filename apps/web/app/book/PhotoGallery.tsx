"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const photos = [
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

export function PhotoGallery() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % photos.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={photos[current].src}
          alt={photos[current].alt}
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
