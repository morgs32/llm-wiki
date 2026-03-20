"use client";

import { ReservationPanelDrawer } from "./ReservationPanelDrawer";
import { Sidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReservationSidebar } from "./ReservationSidebar";

export function Reservation(props: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile();

  return (
    <>
      <ReservationSidebar {...props} />
      <ReservationPanelDrawer isActive={isMobile} />
    </>
  );
}
