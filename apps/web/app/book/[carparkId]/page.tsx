"use client";

import { useEffect, useState } from "react";
import { ReservationPanelSidebar } from "@/app/book/ReservationPanelSidebar";
import { ReservationPanelDrawer } from "@/app/book/ReservationPanelDrawer";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BookCarparkPage() {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(isMobile);
  }, [isMobile]);

  return (
    <>
      <div className="h-full min-h-0 overflow-hidden p-2 pl-0">
        <div className="pointer-events-auto flex h-full min-h-0 min-w-0">
          <ReservationPanelSidebar />
        </div>
      </div>
      {isMobile && (
        <ReservationPanelDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      )}
    </>
  );
}
