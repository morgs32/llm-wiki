"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ReservationDetails } from "@/app/book/ReservationDetails";
import { PriceSummary } from "@/app/book/PriceSummary";
import { ConfirmButton } from "@/app/book/ConfirmButton";

export function ReservationPanelContent() {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 p-4">
        <ReservationDetails />
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
  );
}
