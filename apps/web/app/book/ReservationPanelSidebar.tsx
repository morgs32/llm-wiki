"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ReservationPanelContent } from "@/app/book/ReservationPanelContent";

export function ReservationPanelSidebar() {
  return (
    <Sidebar
      side="right"
      collapsible="none"
      className="my-2 mr-2 hidden h-[calc(100%-1rem)] w-[22rem] flex-col rounded-xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm md:flex"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <h2 className="text-sm font-semibold tracking-tight">Reservation details</h2>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto">
        <ReservationPanelContent />
      </SidebarContent>
    </Sidebar>
  );
}
