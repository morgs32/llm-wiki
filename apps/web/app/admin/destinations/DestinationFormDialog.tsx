"use client";

import * as React from "react";
import { useMutation } from "convex/react";

import { api } from "@packages/backend/convex/_generated/api";
import type { PlaceDetails } from "@/components/PlacesAutocomplete";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface DestinationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DestinationFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: DestinationFormDialogProps) {
  const [selectedPlace, setSelectedPlace] = React.useState<PlaceDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const createDestination = useMutation(api.destinations.createDestination);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedPlace(null);
      setSubmitError(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const location = selectedPlace?.location;
    if (!selectedPlace || !location) {
      setSubmitError("Please select a city to add.");
      return;
    }

    const slug = toSlug(selectedPlace.name);
    if (!slug) {
      setSubmitError("Could not derive a destination slug from the selected city.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createDestination({
        name: selectedPlace.name.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        slug,
      });
      onSuccess();
      handleOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Destination</DialogTitle>
          <DialogDescription>
            Pick a city/municipality. We&apos;ll save its name, coordinates, and a slug for linking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PlacesAutocomplete
            mode="cities"
            size="sm"
            placeholder="City or municipality"
            fullWidth
            onPlaceSelect={(place) => {
              setSelectedPlace(place);
              setSubmitError(null);
            }}
          />

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedPlace || isSubmitting}>
              {isSubmitting ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

