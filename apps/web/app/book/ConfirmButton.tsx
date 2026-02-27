"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Check, Loader2 } from "lucide-react";

const totalPrice = 155.7;

export function ConfirmButton() {
  const [state, setState] = useState<
    "idle" | "loading" | "confirmed"
  >("idle");

  const handleConfirm = () => {
    setState("loading");
    setTimeout(() => setState("confirmed"), 1800);
  };

  if (state === "confirmed") {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
          <Check className="h-6 w-6 text-accent-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Booking Confirmed
        </p>
        <p className="text-xs text-muted-foreground">
          A confirmation email has been sent.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        size="lg"
        onClick={handleConfirm}
        disabled={state === "loading"}
        className="w-full gap-2 bg-primary py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Confirm Booking — ${totalPrice.toFixed(2)}
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        You will be charged ${totalPrice.toFixed(2)}. By confirming, you agree
        to the cancellation policy.
      </p>
    </div>
  );
}
