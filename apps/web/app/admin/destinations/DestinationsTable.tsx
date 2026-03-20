"use client";

import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Doc } from "@packages/backend/convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";
import { IconDotsVertical } from "@tabler/icons-react";

import { SimpleTable } from "@/components/SimpleTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Destination = Doc<"destinations">;

const columns: ColumnDef<Destination>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() ? true : false)
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-sm">{row.original.slug}</span>
    ),
  },
  {
    accessorKey: "latitude",
    header: () => <div className="text-right">Latitude</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.original.latitude.toFixed(4)}</div>
    ),
  },
  {
    accessorKey: "longitude",
    header: () => <div className="text-right">Longitude</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.original.longitude.toFixed(4)}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild nativeButton>
          <Button variant="ghost" className="size-8 p-0">
            <span className="sr-only">Open menu</span>
            <IconDotsVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export function DestinationsTable() {
  const destinations = useQuery(api.destinations.listDestinations);
  const isLoading = destinations === undefined;
  const data = destinations ?? [];

  return (
    <SimpleTable<Destination, unknown>
      columns={columns}
      data={data}
      getRowId={(row) => row._id}
      filterColumnId="name"
      filterPlaceholder="Filter destinations..."
      emptyMessage="No destinations yet."
      isLoading={isLoading}
    />
  );
}
