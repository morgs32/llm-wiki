"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlacesAutocomplete, type PlaceDetails } from "@/components/PlacesAutocomplete";

interface RequestCityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestCityModal({ open, onOpenChange }: RequestCityModalProps) {
  const [selectedPlace, setSelectedPlace] = React.useState<PlaceDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const createDestinationRequest = useMutation(
    api.destinationRequests.createDestinationRequest,
  );

  const handlePlaceSelect = React.useCallback((place: PlaceDetails | null) => {
    setSelectedPlace(place);
    setSubmitError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace?.location) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createDestinationRequest({
        placeId: selectedPlace.id,
        name: selectedPlace.name,
        address: selectedPlace.address || undefined,
        latitude: selectedPlace.location.latitude,
        longitude: selectedPlace.location.longitude,
        types: selectedPlace.types?.length ? selectedPlace.types : undefined,
      });
      setSelectedPlace(null);
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedPlace(null);
      setSubmitError(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request service in your city</DialogTitle>
          <DialogDescription>
            Search for your city or municipality. We&apos;ll use your request when planning new
            destinations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PlacesAutocomplete
            mode="cities"
            placeholder="City or municipality"
            fullWidth
            onPlaceSelect={handlePlaceSelect}
          />
          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedPlace || isSubmitting}
            >
              {isSubmitting ? "Submitting…" : "Submit request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
