"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ReservationPanelContent } from "@/app/book/ReservationPanelContent";

interface IProps {
  isActive: boolean;
}

export function ReservationPanelDrawer({ isActive }: IProps) {
  return (
    <Drawer open={isActive} direction="bottom">
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
