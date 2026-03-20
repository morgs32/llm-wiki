"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PhotoGallery } from "@/app/book/PhotoGallery";
import { ReservationDetails } from "@/app/book/ReservationDetails";
import { PriceSummary } from "@/app/book/PriceSummary";
import { ConfirmButton } from "@/app/book/ConfirmButton";
import { MapPin, ArrowLeft, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BookCarparkPage() {
  const isMobile = useIsMobile();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const params = useParams<{ carparkId: string }>();
  const carparkId = params?.carparkId;

  return (
    <>
      <div className="h-full min-h-0 overflow-hidden p-2 pl-0">
      <div className="flex-1 min-h-0 min-w-0 max-w-2xl rounded-lg border border-border bg-card shadow-lg overflow-hidden flex flex-col">
        <header className="sticky top-0 z-10 shrink-0 border-b border-border bg-card/80 backdrop-blur-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <Link
              href="/book"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="flex items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold tracking-tight text-foreground">
                Red Rope Parking
              </span>
            </div>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/book" aria-label="Close">
                <X className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-auto">
          <TooltipProvider>
            <div className="border-b border-border">
              <PhotoGallery carparkId={carparkId} />
            </div>

            <div className="flex flex-col gap-6 p-5 md:p-8">
              <div className="hidden md:block">
                <ReservationDetails />
              </div>
              <PriceSummary />

              <div className="rounded-xl bg-secondary px-4 py-3">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Free cancellation</span> up to
                  24 hours before check-in. After that, a fee of one day rate applies.
                </p>
              </div>

              <ConfirmButton />
            </div>
          </TooltipProvider>
        </div>
      </div>
      </div>
      {isMobile && (
        <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
          <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-lg">
            <SheetHeader className="shrink-0 border-b border-border pb-4">
              <SheetTitle>Reservation details</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <TooltipProvider>
                <ReservationDetails />
              </TooltipProvider>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
