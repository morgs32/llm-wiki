import { DestinationsTable } from "@/app/admin/destinations/DestinationsTable";
import { Button } from "@/components/ui/button";

export default function DestinationsPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex items-start justify-between gap-4 px-4 lg:px-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Destinations</h2>
            <p className="text-muted-foreground text-sm">Destinations from Convex.</p>
          </div>
          <Button>Add Destination</Button>
        </div>
        <div className="px-4 lg:px-6">
          <DestinationsTable />
        </div>
      </div>
    </div>
  );
}
