"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

export interface DateRangePickerProps {
  className?: string;
  mode?: "single" | "range";
  checkIn?: Date;
  checkOut?: Date;
  onCheckInChange?: (date: Date) => void;
  onCheckOutChange?: (date: Date) => void;
}

const defaultCheckIn = new Date(2026, 1, 24);
const defaultCheckOut = new Date(2026, 1, 25);

export function DateRangePicker({
  className,
  mode = "range",
  checkIn: controlledCheckIn,
  checkOut: controlledCheckOut,
  onCheckInChange,
  onCheckOutChange,
}: DateRangePickerProps) {
  const internalCheckIn = controlledCheckIn ?? defaultCheckIn;
  const internalCheckOut = controlledCheckOut ?? defaultCheckOut;

  const date: DateRange | undefined =
    internalCheckIn && internalCheckOut
      ? { from: internalCheckIn, to: internalCheckOut }
      : internalCheckIn
        ? { from: internalCheckIn, to: undefined }
        : undefined;

  const setDateRange = React.useCallback(
    (range: DateRange | undefined) => {
      if (range?.from) {
        onCheckInChange?.(range.from);
      }
      if (range?.to) {
        onCheckOutChange?.(range.to);
      } else if (range?.from) {
        onCheckOutChange?.(range.from);
      }
    },
    [onCheckInChange, onCheckOutChange],
  );

  const setSingleDate = React.useCallback(
    (singleDate: Date | undefined) => {
      if (singleDate) {
        onCheckInChange?.(singleDate);
        onCheckOutChange?.(singleDate);
      }
    },
    [onCheckInChange, onCheckOutChange],
  );

  const isSingle = mode === "single";
  const triggerLabel = isSingle
    ? date?.from
      ? format(date.from, "LLL dd, y")
      : "Pick a date"
    : date?.from
      ? date.to
        ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
        : format(date.from, "LLL dd, y")
      : "Pick dates";

  return (
    <Field className={cn("w-full", className)}>
      <FieldLabel htmlFor="date-picker-range" className="sr-only">
        {isSingle ? "Date" : "Check-in and check-out dates"}
      </FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker-range"
            size="lg"
            className="w-full justify-start gap-2 rounded-md border-border bg-background px-2 py-2 shadow-xs focus-visible:ring-2"
          >
            <CalendarIcon className="size-4 shrink-0" />
            <span className="text-foreground text-sm font-normal">{triggerLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {isSingle ? (
            <Calendar
              mode="single"
              defaultMonth={date?.from}
              selected={date?.from}
              onSelect={setSingleDate}
              numberOfMonths={1}
            />
          ) : (
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          )}
        </PopoverContent>
      </Popover>
    </Field>
  );
}
