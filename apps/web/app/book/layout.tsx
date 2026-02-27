"use client";

import { SearchCarparks } from "@/app/book/SearchCarparks";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MapView } from "@/app/book/MapView";
import { BookSearchProvider } from "./BookSearchContext";

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <BookSearchProvider>
      <div className="relative h-dvh w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MapView />
        </div>

        <div className="relative z-10 h-full pointer-events-none">
          <SidebarProvider
            style={
              {
                "--sidebar-width": "22rem",
              } as React.CSSProperties
            }
          >
            <div className="pointer-events-auto">
              <SearchCarparks />
            </div>
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </BookSearchProvider>
  );
}
