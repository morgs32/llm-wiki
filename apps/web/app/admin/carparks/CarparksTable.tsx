"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Doc, Id } from "@packages/backend/convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";

import { SimpleTable } from "@/components/SimpleTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type CarparkWithDestination = Doc<"carparks"> & {
  destinationName: string;
  parkingSpaceCount: number;
  firstPlacePhotoName?: string | null;
  placePhotoCount?: number;
};

const columns = (
  onEdit: (carpark: CarparkWithDestination) => void,
  onDelete: (carpark: CarparkWithDestination) => void,
): ColumnDef<CarparkWithDestination>[] => [
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-muted-foreground line-clamp-2 max-w-[200px]">
        {row.original.description}
      </span>
    ),
  },
  {
    accessorKey: "destinationName",
    header: "Destination",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">{row.original.destinationName || "—"}</span>
    ),
  },
  {
    id: "images",
    header: "Images",
    cell: ({ row }) => {
      const manualUrls = row.original.imageUrls ?? [];
      const manualFirst = manualUrls[0];
      let first: string | undefined = manualFirst;
      let rest = manualUrls.length - 1;

      if (!first && row.original.firstPlacePhotoName) {
        first = `/api/places/photo?name=${encodeURIComponent(
          row.original.firstPlacePhotoName,
        )}&maxHeightPx=200&maxWidthPx=200`;
        rest = Math.max(0, (row.original.placePhotoCount ?? 1) - 1);
      }
      return (
        <div className="flex items-center gap-1">
          {first ? (
            <div className="relative h-8 w-12 shrink-0 overflow-hidden rounded border bg-muted">
              <img src={first} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
          {rest > 0 && <span className="text-muted-foreground text-xs">+{rest}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "pricePerNight",
    header: () => <div className="text-right">Price/night</div>,
    cell: ({ row }) => <div className="text-right tabular-nums">${row.original.pricePerNight}</div>,
  },
  {
    accessorKey: "parkingSpaceCount",
    header: () => <div className="text-right">Spaces</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.original.parkingSpaceCount}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const carpark = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild nativeButton>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <IconDotsVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(carpark)}>
              <IconPencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(carpark)}>
              <IconTrash className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface CarparksTableProps {
  onAddClick?: () => void;
  onEdit?: (carpark: CarparkWithDestination) => void;
  onDelete?: (carpark: CarparkWithDestination) => void;
}

export function CarparksTable({ onAddClick, onEdit = () => {}, onDelete }: CarparksTableProps) {
  const list = useQuery(api.carparks.listCarparks);
  const removeCarpark = useMutation(api.carparks.removeCarpark);
  const isLoading = list === undefined;
  const data = list ?? [];

  const handleDelete = async (carpark: CarparkWithDestination) => {
    if (onDelete) {
      onDelete(carpark);
      return;
    }
    if (!window.confirm(`Delete "${carpark.name}"?`)) return;
    try {
      await removeCarpark({ carparkId: carpark._id });
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <SimpleTable<CarparkWithDestination, unknown>
      columns={columns(onEdit, handleDelete)}
      data={data}
      getRowId={(row) => row._id}
      filterColumnId="name"
      filterPlaceholder="Filter carparks..."
      emptyMessage="No carparks yet."
      isLoading={isLoading}
    />
  );
}
