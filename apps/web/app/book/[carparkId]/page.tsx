"use client";

import { useState } from "react";
import Link from "next/link";
import { MapView } from "@/app/book/MapView";
import { BookSearchProvider } from "@/app/book/BookSearchContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PhotoGallery } from "@/app/book/PhotoGallery";
import { ReservationDetails } from "@/app/book/ReservationDetails";
import { PriceSummary } from "@/app/book/PriceSummary";
import { ConfirmButton } from "@/app/book/ConfirmButton";
import { MapPin, ArrowLeft, X, FileText } from "lucide-react";

export default function BookCarparkPage() {
  const [detailsOpen, setDetailsOpen] = useState(true);

  return (
    <BookSearchProvider>
      <div className="relative h-dvh w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MapView />
        </div>

        <div className="absolute inset-0 z-10 flex items-stretch justify-stretch p-2 pl-0 pointer-events-none">
          <div className="flex-1 min-h-0 min-w-0 max-w-2xl rounded-lg border border-border bg-card shadow-lg overflow-hidden flex flex-col pointer-events-auto">
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
                    Carrezo
                  </span>
                </div>
                <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Link href="/book" aria-label="Close">
                    <X className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </header>

            <div className="flex-1 min-h-0 overflow-auto">
              <TooltipProvider>
                <div className="border-b border-border">
                  <PhotoGallery />
                </div>

                <div className="flex flex-col gap-6 p-5 md:p-8">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setDetailsOpen(true)}
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    View reservation details
                  </Button>
                  <PriceSummary />

                  <div className="rounded-xl bg-secondary px-4 py-3">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Free cancellation
                      </span>{" "}
                      up to 24 hours before check-in. After that, a fee of one
                      day rate applies.
                    </p>
                  </div>

                  <ConfirmButton />
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 sm:max-w-lg"
        >
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
    </BookSearchProvider>
  );
}
