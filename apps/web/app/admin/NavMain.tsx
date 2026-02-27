"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Icon } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const isActive =
              pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url));
            return (
              <SidebarMenuItem key={item.title}>
                <Button
                  asChild
                  variant="ghost"
                  className="flex w-full flex-row items-center justify-start gap-2 rounded-lg px-3 py-2 ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-active:font-medium focus-visible:ring-2"
                >
                  <Link
                    href={item.url}
                    data-active={isActive ? "" : undefined}
                    data-sidebar="menu-button"
                    data-slot="sidebar-menu-button"
                  >
                    {item.icon && <item.icon className="size-4 shrink-0" />}
                    <span>{item.title}</span>
                  </Link>
                </Button>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
