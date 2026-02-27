"use client";

import { useCallback, useRef, useState } from "react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

export interface DestinationSelection {
  source: "convex" | "google";
  id: string;
  name: string;
  address?: string;
  location: { latitude: number; longitude: number } | null;
}

interface DestinationAutocompleteProps {
  size?: "default" | "sm";
  placeholder?: string;
  onDestinationSelect?: (destination: DestinationSelection | null) => void;
  onRequestCity?: (query: string) => void;
  className?: string;
}

export function DestinationAutocomplete({
  size = "default",
  placeholder = "City or destination",
  onDestinationSelect,
  onRequestCity,
  className,
}: DestinationAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<DestinationSelection | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRequestCity = useCallback(() => {
    onRequestCity?.(query.trim());
    setIsOpen(false);
  }, [query, onRequestCity]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), 200);
  }, []);

  const handleFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Command
        shouldFilter={false}
        className={cn(
          "rounded-md border border-border bg-background shadow-xs overflow-visible",
          size === "sm" && "p-0 border-0 bg-transparent shadow-none",
        )}
      >
        <CommandInput
          size={size}
          placeholder={placeholder}
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            if (selected) {
              setSelected(null);
              onDestinationSelect?.(null);
            }
            if (value.trim()) setIsOpen(true);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {isOpen && (
          <CommandList className="absolute top-full left-0 right-0 z-50 mt-1 max-h-72 rounded-md border border-border bg-popover shadow-lg overflow-auto">
            <CommandGroup>
              <CommandItem
                value="request-city"
                onSelect={handleRequestCity}
                onMouseDown={(e) => e.preventDefault()}
                className="flex items-center gap-2"
              >
                <PlusCircle className="size-4 shrink-0" />
                <span>Request service in your city</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  );
}
