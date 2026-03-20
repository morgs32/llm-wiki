"use client";

import Link from "next/link";
import { IconDashboard, IconMapPin, IconParking } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Destinations",
      url: "/admin/destinations",
      icon: IconMapPin,
    },
    {
      title: "Carparks",
      url: "/admin/carparks",
      icon: IconParking,
    },
  ],
};

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <Button asChild variant="ghost" size="lg" className="w-full justify-start">
          <Link href="/admin">
            <span className="font-semibold">Red Rope Parking Admin</span>
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/">
            <span className="font-semibold">Red Rope Parking</span>
          </Link>
        </Button>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
