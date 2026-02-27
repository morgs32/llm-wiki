"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { SearchCarparksContent } from "@/app/book/SearchCarparksContent";

const snapPoints = [0.8, 1];

export function SearchCarparksDrawer({
  isActive,
}: {
  isActive: boolean;
}) {
  const [snap, setSnap] = React.useState<number | string | null>(snapPoints[1]);

  return (
    <Drawer
      open={isActive}
      modal={false}
      dismissible={false}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <DrawerContent showOverlay={false} variant="sidebar">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SearchCarparksContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
