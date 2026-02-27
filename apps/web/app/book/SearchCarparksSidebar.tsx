"use client";

import {
  Sidebar,
} from "@/components/ui/sidebar";
import { SearchCarparksContent } from "@/app/book/SearchCarparksContent";

export function SearchCarparksSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SearchCarparksContent />
    </Sidebar>
  );
}
