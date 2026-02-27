"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { IconPlus, IconTrash } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import type { PlaceDetails } from "@/components/PlacesAutocomplete";

interface CarparkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carparkId: Id<"carparks"> | null;
  onSuccess: () => void;
}

const emptyForm = {
  name: "",
  description: "",
  address: "",
  latitude: "",
  longitude: "",
  pricePerNight: "",
  parkingSpaceCount: "",
  destinationId: "" as Id<"destinations"> | "",
  amenities: "" as string,
  imageUrls: [] as string[],
};

export function CarparkFormDialog({
  open,
  onOpenChange,
  carparkId,
  onSuccess,
}: CarparkFormDialogProps) {
  const [form, setForm] = React.useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const carpark = useQuery(
    api.carparks.getCarpark,
    carparkId ? { carparkId } : "skip"
  );
  const destinations = useQuery(api.destinations.listDestinations);
  const createCarpark = useMutation(api.carparks.createCarpark);
  const updateCarpark = useMutation(api.carparks.updateCarpark);

  const isEdit = !!carparkId;

  React.useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    if (carpark) {
      setForm({
        name: carpark.name,
        description: carpark.description,
        address: carpark.address,
        latitude: String(carpark.latitude),
        longitude: String(carpark.longitude),
        pricePerNight: String(carpark.pricePerNight),
        parkingSpaceCount: String(carpark.parkingSpaceCount),
        destinationId: carpark.destinationId,
        amenities: carpark.amenities.join(", "),
        imageUrls: carpark.imageUrls?.length ? [...carpark.imageUrls] : [],
      });
    } else if (!isEdit) {
      setForm(emptyForm);
    }
  }, [open, isEdit, carpark]);

  const update = (updates: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const addImageUrl = () => update({ imageUrls: [...form.imageUrls, ""] });
  const setImageUrl = (index: number, value: string) => {
    const next = [...form.imageUrls];
    next[index] = value;
    update({ imageUrls: next });
  };
  const removeImageUrl = (index: number) => {
    const next = form.imageUrls.filter((_, i) => i !== index);
    update({ imageUrls: next });
  };

  const handlePlaceSelect = React.useCallback(
    (place: PlaceDetails | null) => {
      if (!place) {
        update({
          name: "",
          description: "",
          address: "",
          latitude: "",
          longitude: "",
        });
        return;
      }
      const descriptionPart = place.primaryTypeDisplayName
        ? place.primaryTypeDisplayName
        : place.types?.[0]
          ? place.types[0].replace(/_/g, " ")
          : "";
      const description = descriptionPart
        ? place.address
          ? `${descriptionPart} · ${place.address}`
          : descriptionPart
        : place.address || "";
      update({
        name: place.name,
        description,
        address: place.address || "",
        latitude: place.location ? String(place.location.latitude) : "",
        longitude: place.location ? String(place.location.longitude) : "",
      });
    },
    [update]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const lat = parseFloat(form.latitude);
      const lng = parseFloat(form.longitude);
      const price = parseFloat(form.pricePerNight);
      const parkingSpaceCount = parseInt(form.parkingSpaceCount, 10);
      const destinationId = form.destinationId as Id<"destinations">;
      const amenities = form.amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const imageUrls = form.imageUrls.map((s) => s.trim()).filter(Boolean);

      if (!form.name.trim()) throw new Error("Name is required");
      if (!destinationId) throw new Error("Destination is required");
      if (Number.isNaN(lat) || Number.isNaN(lng))
        throw new Error("Valid latitude and longitude required");
      if (Number.isNaN(price) || price < 0)
        throw new Error("Valid price per night required");
      if (Number.isNaN(parkingSpaceCount) || parkingSpaceCount < 1)
        throw new Error("Parking spaces must be at least 1");

      if (isEdit && carparkId) {
        await updateCarpark({
          carparkId,
          name: form.name.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
          latitude: lat,
          longitude: lng,
          pricePerNight: price,
          parkingSpaceCount,
          destinationId,
          amenities,
          imageUrls,
        });
      } else {
        await createCarpark({
          name: form.name.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
          latitude: lat,
          longitude: lng,
          pricePerNight: price,
          parkingSpaceCount,
          destinationId,
          amenities,
          imageUrls,
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isEdit && carpark === undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Carpark" : "Add Carpark"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Search for a place</Label>
            <PlacesAutocomplete
              size="sm"
              fullWidth
              placeholder="Search address or place..."
              onPlaceSelect={handlePlaceSelect}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Carpark name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Description"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => update({ address: e.target.value })}
              placeholder="Address"
            />
          </div>
          <input
            type="hidden"
            id="latitude"
            name="latitude"
            value={form.latitude}
            readOnly
            aria-hidden
          />
          <input
            type="hidden"
            id="longitude"
            name="longitude"
            value={form.longitude}
            readOnly
            aria-hidden
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pricePerNight">Price per night ($)</Label>
              <Input
                id="pricePerNight"
                type="number"
                min={0}
                step="0.01"
                value={form.pricePerNight}
                onChange={(e) => update({ pricePerNight: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parkingSpaceCount">Parking spaces</Label>
              <Input
                id="parkingSpaceCount"
                type="number"
                min={1}
                value={form.parkingSpaceCount}
                onChange={(e) => update({ parkingSpaceCount: e.target.value })}
                placeholder="1"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Destination</Label>
            <Select
              value={form.destinationId || undefined}
              onValueChange={(value) =>
                update({
                  destinationId: (value ?? "") as Id<"destinations"> | "",
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select destination">
                  {(value: string | undefined) =>
                    value
                      ? (destinations ?? []).find((d) => d._id === value)?.name ?? value
                      : undefined
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                {(destinations ?? []).map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amenities">Amenities (comma-separated)</Label>
            <Input
              id="amenities"
              value={form.amenities}
              onChange={(e) => update({ amenities: e.target.value })}
              placeholder="e.g. WiFi, Pool, Gym"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Image URLs</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageUrl}
              >
                <IconPlus className="mr-1 size-4" />
                Add image
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {form.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-start rounded border p-2"
                >
                  <div className="flex-1 min-w-0 flex gap-2 items-start">
                    <Input
                      value={url}
                      onChange={(e) => setImageUrl(index, e.target.value)}
                      placeholder="https://..."
                      className="flex-1 min-w-0"
                    />
                    {url ? (
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-muted">
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImageUrl(index)}
                    aria-label="Remove image"
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              ))}
              {form.imageUrls.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No images. Click &quot;Add image&quot; to add an image URL.
                </p>
              )}
            </div>
          </div>
          {submitError && (
            <p className="text-destructive text-sm">{submitError}</p>
          )}
          <DialogFooter showCloseButton={false}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Saving…" : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
