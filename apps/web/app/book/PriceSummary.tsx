import { Separator } from "@/components/ui/separator";

const reservation = {
  dailyRate: 28,
  totalDays: 5,
  serviceFee: 4.5,
  taxes: 11.2,
};

const subtotal = reservation.dailyRate * reservation.totalDays;
const totalPrice = subtotal + reservation.serviceFee + reservation.taxes;

export function PriceSummary() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Price Breakdown
      </h2>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground">
            ${reservation.dailyRate}.00 x {reservation.totalDays} days
          </span>
          <span className="font-medium text-foreground">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Service fee</span>
          <span className="text-foreground">
            ${reservation.serviceFee.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Taxes</span>
          <span className="text-foreground">
            ${reservation.taxes.toFixed(2)}
          </span>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-foreground">Total</span>
        <span className="text-2xl font-bold text-foreground">
          ${totalPrice.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
