"use client";

import {
  Sidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchCarparksDrawer } from "@/app/book/SearchCarparksDrawer";
import { SearchCarparksSidebar } from "@/app/book/SearchCarparksSidebar";

export function SearchCarparks(props: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile();

  return (
    <>
      <SearchCarparksSidebar {...props} />
      <SearchCarparksDrawer isActive={isMobile} />
    </>
  );
}
