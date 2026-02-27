"use client";

import {
  CalendarDays,
  Clock,
  MapPin,
  Car,
  Shield,
  Phone,
  Globe,
  Zap,
  Accessibility,
  Copy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// Mock data (same as reference)
const placeDetails = {
  displayName: { text: "Pacific Heights Parking Center" },
  formattedAddress: "2150 Fillmore St, San Francisco, CA 94115, USA",
  nationalPhoneNumber: "(415) 555-0192",
  websiteUri: "https://pacificheightsparking.example.com",
  regularOpeningHours: {
    weekdayDescriptions: [
      "Monday: Open 24 hours",
      "Tuesday: Open 24 hours",
      "Wednesday: Open 24 hours",
      "Thursday: Open 24 hours",
      "Friday: Open 24 hours",
      "Saturday: Open 24 hours",
      "Sunday: Open 24 hours",
    ],
  },
  parkingOptions: {
    freeParkingLot: false,
    paidParkingLot: true,
    freeStreetParking: false,
    paidStreetParking: false,
    valetParking: true,
    freeGarageParking: false,
    paidGarageParking: true,
  },
  accessibilityOptions: {
    wheelchairAccessibleParking: true,
    wheelchairAccessibleEntrance: true,
  },
  evChargeOptions: {
    connectorCount: 8,
    connectorAggregation: [
      { type: "EV_CONNECTOR_TYPE_J1772", maxChargeRateKw: 19.2, count: 4 },
      { type: "EV_CONNECTOR_TYPE_CCS2", maxChargeRateKw: 150, count: 4 },
    ],
  },
};

const reservation = {
  spotNumber: "B2-14",
  level: "Level B2",
  startDate: "March 3, 2026",
  endDate: "March 7, 2026",
  startTime: "10:00 AM",
  endTime: "6:00 PM",
  vehicleType: "Standard (Sedan / SUV)",
  dailyRate: 28,
  totalDays: 5,
  serviceFee: 4.5,
  taxes: 11.2,
};

export function ReservationDetails() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
          {placeDetails.displayName.text}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {placeDetails.formattedAddress}
        </p>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(placeDetails.formattedAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <MapPin className="h-4 w-4" />
                <span className="sr-only">View on map</span>
              </a>
            </TooltipTrigger>
            <TooltipContent>View on map</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`tel:${placeDetails.nationalPhoneNumber}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Phone className="h-4 w-4" />
                <span className="sr-only">Call {placeDetails.nationalPhoneNumber}</span>
              </a>
            </TooltipTrigger>
            <TooltipContent>{placeDetails.nationalPhoneNumber}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={placeDetails.websiteUri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
                <span className="sr-only">Visit website</span>
              </a>
            </TooltipTrigger>
            <TooltipContent>pacificheightsparking.com</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Clock className="h-4 w-4" />
                <span className="sr-only">Opening hours</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Open 24 hours</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard?.writeText(placeDetails.formattedAddress)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy address</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Copy address</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Reservation Dates
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Check-in
            </span>
            <span className="text-base font-bold text-foreground">
              {reservation.startDate}
            </span>
            <span className="text-sm text-muted-foreground">
              {reservation.startTime}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Check-out
            </span>
            <span className="text-base font-bold text-foreground">
              {reservation.endDate}
            </span>
            <span className="text-sm text-muted-foreground">
              {reservation.endTime}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{reservation.totalDays} days total</span>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Spot Details
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-xs font-bold">B2</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  Spot {reservation.spotNumber}
                </span>
                <span className="text-xs text-muted-foreground">
                  {reservation.level}
                </span>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              Covered
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Car className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground">
              {reservation.vehicleType}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Facility Features
        </h2>
        <div className="flex flex-wrap gap-2">
          {placeDetails.parkingOptions.valetParking && (
            <Badge variant="outline" className="gap-1.5 py-1.5 text-foreground">
              <Car className="h-3 w-3" /> Valet Available
            </Badge>
          )}
          {placeDetails.evChargeOptions && (
            <Badge variant="outline" className="gap-1.5 py-1.5 text-foreground">
              <Zap className="h-3 w-3" />{" "}
              {placeDetails.evChargeOptions.connectorCount} EV Chargers
            </Badge>
          )}
          {placeDetails.accessibilityOptions.wheelchairAccessibleParking && (
            <Badge variant="outline" className="gap-1.5 py-1.5 text-foreground">
              <Accessibility className="h-3 w-3" /> Accessible
            </Badge>
          )}
          <Badge variant="outline" className="gap-1.5 py-1.5 text-foreground">
            <Shield className="h-3 w-3" /> 24/7 Security
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1.5 text-foreground">
            <Clock className="h-3 w-3" /> 24hr Access
          </Badge>
        </div>
      </div>

      <Separator />

      {placeDetails.evChargeOptions && (
        <>
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              EV Charging
            </h2>
            <div className="flex flex-col gap-2">
              {placeDetails.evChargeOptions.connectorAggregation.map(
                (connector) => (
                  <div
                    key={connector.type}
                    className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2"
                  >
                    <span className="text-sm text-foreground">
                      {connector.type === "EV_CONNECTOR_TYPE_J1772"
                        ? "J1772 (Level 2)"
                        : "CCS2 (DC Fast)"}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {connector.maxChargeRateKw} kW
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {connector.count} ports
                      </Badge>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
          <Separator />
        </>
      )}

      <Separator />
    </div>
  );
}
