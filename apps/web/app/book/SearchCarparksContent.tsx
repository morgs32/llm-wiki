"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { MapPin, PlusCircle, Wifi } from "lucide-react";

import {
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangePicker } from "@/app/book/DateRangePicker";
import {
  CarparkCard,
  getCarparkImageUrl,
  type CarparkData,
} from "@/app/book/CarparkCard";
import { RequestCityModal } from "@/app/book/RequestCityModal";
import { useBookSearch } from "@/app/book/BookSearchContext";

export function SearchCarparksContent() {
  const [multipleDays, setMultipleDays] = React.useState(false);
  const [requestCityOpen, setRequestCityOpen] = React.useState(false);
  const carparks = useQuery(api.carparks.listCarparks);
  const { setMarkers } = useBookSearch();

  React.useEffect(() => {
    if (!carparks || carparks.length === 0) {
      setMarkers([]);
      return;
    }
    setMarkers(
      carparks.map((c) => ({
        id: String(c._id),
        name: c.name,
        rating: 0,
        lng: c.longitude,
        lat: c.latitude,
        count: c.parkingSpaceCount ?? 0,
      }))
    );
  }, [carparks, setMarkers]);

  const carparkCards: CarparkData[] = React.useMemo(() => {
    if (!carparks) return [];
    return carparks.map((c) => ({
      id: c._id,
      name: c.name,
      image: getCarparkImageUrl(c) || "/placeholder-carpark.svg",
      spacesAvailable: c.parkingSpaceCount ?? 0,
      amenities: (c.amenities ?? []).slice(0, 1).map((label) => ({
        icon: <Wifi className="size-3" />,
        label,
      })),
    }));
  }, [carparks]);

  return (
    <>
      <SidebarHeader className="gap-3 p-3">
        <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm text-muted-foreground shadow-xs">
          <MapPin className="size-4 shrink-0" />
          <span>Austin</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 border-border bg-background shadow-xs"
          onClick={() => setRequestCityOpen(true)}
        >
          <PlusCircle className="size-4 shrink-0" />
          <span>Request service in your city</span>
        </Button>

        <RequestCityModal open={requestCityOpen} onOpenChange={setRequestCityOpen} />

        <DateRangePicker mode={multipleDays ? "range" : "single"} />

        <label className="flex cursor-pointer items-center gap-2 text-sm text-sidebar-accent-foreground">
          <Checkbox
            checked={multipleDays}
            onCheckedChange={(value) => setMultipleDays(value === true)}
            aria-label="Find parking for multiple days"
          />
          <span>Find parking for multiple days</span>
        </label>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3 pt-0">
          <SidebarGroupContent>
            <div className="flex flex-col gap-2.5">
              {carparkCards.map((carpark) => (
                <Link
                  key={carpark.id}
                  href={`/book/${carpark.id}`}
                  className="block"
                >
                  <CarparkCard carpark={carpark} />
                </Link>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
