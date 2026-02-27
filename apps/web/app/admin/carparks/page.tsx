"use client";

import { CarparksTable } from "./CarparksTable";
import { Button } from "@/components/ui/button";
import { CarparkFormDialog } from "./CarparkFormDialog";
import { useState } from "react";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import type { CarparkWithDestination } from "./CarparksTable";

export default function CarparksPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCarparkId, setEditingCarparkId] = useState<Id<"carparks"> | null>(
    null
  );

  const openCreate = () => {
    setEditingCarparkId(null);
    setFormOpen(true);
  };

  const openEdit = (carpark: CarparkWithDestination) => {
    setEditingCarparkId(carpark._id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingCarparkId(null);
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex items-start justify-between gap-4 px-4 lg:px-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Carparks</h2>
            <p className="text-muted-foreground text-sm">
              Manage carparks with description and pictures.
            </p>
          </div>
          <Button onClick={openCreate}>Add Carpark</Button>
        </div>
        <div className="px-4 lg:px-6">
          <CarparksTable onAddClick={openCreate} onEdit={openEdit} />
        </div>
      </div>
      <CarparkFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingCarparkId(null);
        }}
        carparkId={editingCarparkId}
        onSuccess={closeForm}
      />
    </div>
  );
}
