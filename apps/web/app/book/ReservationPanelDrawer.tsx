"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ReservationPanelContent } from "@/app/book/ReservationPanelContent";

type ReservationPanelDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReservationPanelDrawer({ open, onOpenChange }: ReservationPanelDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent variant="sidebar" className="h-[85dvh] max-h-[85dvh]">
        <DrawerHeader className="shrink-0 border-b border-sidebar-border">
          <DrawerTitle>Reservation details</DrawerTitle>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pb-4">
          <ReservationPanelContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
