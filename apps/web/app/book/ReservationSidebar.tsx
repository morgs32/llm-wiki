"use client";

import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { ReservationPanelContent } from "@/app/book/ReservationPanelContent";

export function ReservationSidebar() {
  return (
    <Sidebar variant="floating">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <h2 className="text-sm font-semibold tracking-tight">Reservation details</h2>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto">
        <ReservationPanelContent />
      </SidebarContent>
    </Sidebar>
  );
}
