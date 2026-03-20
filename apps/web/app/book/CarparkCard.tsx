import Image from "next/image";
import { cn } from "@/lib/utils";

export interface CarparkAmenity {
  icon: React.ReactNode;
  label: string;
}

export interface CarparkData {
  id: string;
  name: string;
  image: string;
  spacesAvailable: number;
  amenities: CarparkAmenity[];
}

/** Use when mapping a Convex carpark (with imageUrls) to CarparkData.image */
export function getCarparkImageUrl(carpark: {
  imageUrls?: string[];
  firstPlacePhotoName?: string | null;
}): string {
  const manualFirst = carpark.imageUrls?.[0];
  if (manualFirst) return manualFirst;

  if (carpark.firstPlacePhotoName) {
    return `/api/places/photo?name=${encodeURIComponent(
      carpark.firstPlacePhotoName,
    )}&maxHeightPx=200&maxWidthPx=200`;
  }

  return "";
}

interface CarparkCardProps {
  carpark: CarparkData;
  className?: string;
}

export function CarparkCard({ carpark, className }: CarparkCardProps) {
  return (
    <div
      className={cn(
        "group flex h-[104px] rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-md cursor-pointer",
        className,
      )}
    >
      <div className="relative w-24 shrink-0 self-stretch overflow-hidden">
        <Image
          src={carpark.image}
          alt={carpark.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="96px"
        />
      </div>

      <div className="flex-1 min-w-0 p-2.5">
        <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2">
          {carpark.name}
        </h3>

        <p className="text-xs text-muted-foreground mt-1">
          {carpark.spacesAvailable === 1
            ? "1 space available"
            : `${carpark.spacesAvailable} spaces available`}
        </p>

        <div className="flex flex-col gap-0.5 mt-1.5">
          {carpark.amenities.slice(0, 1).map((amenity, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-muted-foreground shrink-0 [&>svg]:size-3">{amenity.icon}</span>
              <span className="text-xs text-muted-foreground truncate">{amenity.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
