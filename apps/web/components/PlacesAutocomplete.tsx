"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, MapPin, Loader2, Star, Phone, Globe, Clock, X, Building2 } from "lucide-react";

export interface Suggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

export interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  businessStatus: string;
  types: string[];
  primaryType: string;
  primaryTypeDisplayName: string;
  // Google Places "Place Photos (New)" resource names: places/PLACE_ID/photos/PHOTO_RESOURCE
  // Actual image URLs are loaded on demand elsewhere in the app.
  photoNames: string[];
  phone: string;
  website: string;
  rating: number | null;
  ratingCount: number;
  location: { latitude: number; longitude: number } | null;
  isOpen: boolean | null;
}

interface PlacesAutocompleteProps {
  size?: "default" | "sm";
  /** If true, component uses full width (no max-width). */
  fullWidth?: boolean;
  placeholder?: string;
  /** "establishment" = businesses (default); "cities" = cities/municipalities only. */
  mode?: "establishment" | "cities";
  /**
   * Optional proximity bias for results (Google Places locationBias circle).
   * Only applied for `mode="establishment"`.
   */
  proximity?: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
  /** Called when the user selects a place (after details load) or clears selection. */
  onPlaceSelect?: (place: PlaceDetails | null) => void;
}

function formatPlaceType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PlacesAutocomplete({
  size = "default",
  fullWidth = false,
  placeholder = "Search for a business...",
  mode = "establishment",
  proximity,
  onPlaceSelect,
}: PlacesAutocompleteProps) {
  const sm = size === "sm";
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (input.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      const autocompleteUrl =
        mode === "cities" ? "/api/places/autocomplete-cities" : "/api/places/autocomplete";

      let url = `${autocompleteUrl}?query=${encodeURIComponent(input)}`;
      if (proximity && mode === "establishment") {
        url += `&locationLat=${encodeURIComponent(proximity.latitude)}&locationLng=${encodeURIComponent(
          proximity.longitude,
        )}&radiusMeters=${encodeURIComponent(proximity.radiusMeters)}`;
      }
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data.suggestions);
        setIsOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    [mode, proximity],
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  // Fetch place details and check business_status (skip check for cities mode)
  async function selectPlace(suggestion: Suggestion) {
    setIsOpen(false);
    setActiveIndex(-1);
    setQuery(suggestion.mainText);
    setSuggestions([]);
    setIsLoadingDetails(true);
    setDetailsError(null);

    try {
      const res = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(suggestion.placeId)}`,
      );
      const data = await res.json();

      if (data.place) {
        const isCitiesMode = mode === "cities";
        if (isCitiesMode || data.place.businessStatus === "OPERATIONAL") {
          setSelectedPlace(data.place);
          setDetailsError(null);
          onPlaceSelect?.(data.place);
        } else {
          setSelectedPlace(data.place);
          setDetailsError(
            `This business is currently ${formatPlaceType(data.place.businessStatus || "UNKNOWN").toLowerCase()}. Only operational businesses are accepted.`,
          );
          onPlaceSelect?.(data.place);
        }
      }
    } catch {
      setDetailsError("Failed to load place details.");
    } finally {
      setIsLoadingDetails(false);
    }
  }

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectPlace(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function clearSelection() {
    setSelectedPlace(null);
    setQuery("");
    setDetailsError(null);
    setSuggestions([]);
    onPlaceSelect?.(null);
    inputRef.current?.focus();
  }

  const isOperational = mode === "cities" || selectedPlace?.businessStatus === "OPERATIONAL";

  return (
    <div
      className={cn(
        "relative w-full",
        !fullWidth && "mx-auto",
        !fullWidth && (sm ? "max-w-md" : "max-w-xl"),
      )}
    >
      {/* Search Input */}
      <div className="relative">
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 flex items-center",
            sm ? "pl-2.5" : "pl-3.5",
          )}
        >
          {isLoadingSuggestions ? (
            <Loader2
              className={cn("text-muted-foreground animate-spin", sm ? "size-3.5" : "size-4")}
            />
          ) : (
            <Search className={cn("text-muted-foreground", sm ? "size-3.5" : "size-4")} />
          )}
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedPlace) {
              setSelectedPlace(null);
              setDetailsError(null);
              onPlaceSelect?.(null);
            }
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "rounded-md border-border bg-background shadow-xs focus-visible:ring-2",
            sm ? "h-9 pl-8 pr-8 text-base" : "h-12 pl-10 pr-10 text-lg",
          )}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="places-listbox"
          aria-activedescendant={activeIndex >= 0 ? `place-option-${activeIndex}` : undefined}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={clearSelection}
            className={cn(
              "absolute inset-y-0 right-0 flex items-center text-muted-foreground hover:text-foreground transition-colors",
              sm ? "pr-2.5" : "pr-3.5",
            )}
            aria-label="Clear search"
          >
            <X className={cn(sm ? "size-3.5" : "size-4")} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          id="places-listbox"
          role="listbox"
          className={cn(
            "absolute left-0 right-0 z-50 mt-2 w-full min-w-0 rounded-md border border-border bg-popover shadow-lg overflow-hidden",
            !fullWidth && (sm ? "max-w-md" : "max-w-xl"),
          )}
        >
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.placeId}
                  id={`place-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={cn(
                    "flex items-start gap-3 cursor-pointer transition-colors",
                    sm ? "px-3 py-2 gap-2" : "px-4 py-3 gap-3",
                    index === activeIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                  )}
                  onMouseDown={(e) => {
                    // Prevent focus/mouseup side-effects so the dropdown reliably closes on selection.
                    e.preventDefault();
                    selectPlace(suggestion);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <MapPin
                    className={cn(
                      "mt-0.5 shrink-0 text-muted-foreground",
                      sm ? "size-3.5" : "size-4",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "font-medium text-foreground truncate",
                        sm ? "text-sm" : "text-base",
                      )}
                    >
                      {suggestion.mainText}
                    </p>
                    {suggestion.secondaryText && (
                      <p
                        className={cn(
                          "text-muted-foreground truncate mt-0.5",
                          sm ? "text-xs" : "text-sm",
                        )}
                      >
                        {suggestion.secondaryText}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 && !isLoadingSuggestions ? (
            <div className={cn("text-center", sm ? "px-3 py-4" : "px-4 py-6")}>
              <p className={cn("text-muted-foreground", sm ? "text-sm" : "text-base")}>
                No places found for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : null}

          <div className={cn("border-t border-border", sm ? "px-3 py-1.5" : "px-4 py-2")}>
            <p className="text-xs text-muted-foreground/60 text-right">Powered by Google Places</p>
          </div>
        </div>
      )}

      {/* Loading Details */}
      {isLoadingDetails && (
        <div
          className={cn(
            "mt-4 flex items-center justify-center gap-2 rounded-md border border-border bg-card",
            sm ? "py-5" : "py-8",
          )}
        >
          <Loader2 className={cn("animate-spin text-muted-foreground", sm ? "size-4" : "size-5")} />
          <span className={cn("text-muted-foreground", sm ? "text-sm" : "text-base")}>
            Loading place details...
          </span>
        </div>
      )}

      {/* Non-Operational Warning */}
      {detailsError && selectedPlace && !isOperational && (
        <div
          className={cn(
            "mt-4 rounded-md border border-destructive/30 bg-destructive/5",
            sm ? "p-3" : "p-4",
          )}
        >
          <p className={cn("text-destructive font-medium", sm ? "text-sm" : "text-base")}>
            {detailsError}
          </p>
          <div className={cn("flex items-center gap-2", sm ? "mt-1.5" : "mt-2")}>
            <Building2 className={cn("text-muted-foreground", sm ? "size-3.5" : "size-4")} />
            <span className={cn("text-muted-foreground", sm ? "text-sm" : "text-base")}>
              {selectedPlace.name}
            </span>
            <Badge variant="destructive" className="text-xs">
              {formatPlaceType(selectedPlace.businessStatus)}
            </Badge>
          </div>
        </div>
      )}

      {/* Selected Place Card */}
      {selectedPlace && isOperational && !isLoadingDetails && (
        <div
          className={cn(
            "mt-4 rounded-md border border-border bg-card overflow-hidden shadow-sm",
            sm && "text-sm",
          )}
        >
          {/* Header */}
          <div className={cn(sm ? "px-3 pt-3 pb-2" : "px-5 pt-5 pb-4")}>
            <div className={cn("flex items-start justify-between", sm ? "gap-2" : "gap-3")}>
              <div className="min-w-0 flex-1">
                <h3
                  className={cn(
                    "font-semibold text-card-foreground text-pretty",
                    sm ? "text-sm" : "text-xl",
                  )}
                >
                  {selectedPlace.name}
                </h3>
                {selectedPlace.address && (
                  <p
                    className={cn(
                      "text-muted-foreground flex items-start gap-1.5",
                      sm ? "text-xs mt-0.5" : "text-base mt-1",
                    )}
                  >
                    <MapPin className={cn("mt-0.5 shrink-0", sm ? "size-3" : "size-3.5")} />
                    <span>{selectedPlace.address}</span>
                  </p>
                )}
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "shrink-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                  sm && "text-[10px] px-1.5 py-0",
                )}
              >
                {mode === "cities" ? "City" : "Operational"}
              </Badge>
            </div>
          </div>

          {/* Metadata */}
          <div className={cn("border-t border-border", sm ? "px-3 py-2" : "px-5 py-4")}>
            <div className={cn("flex flex-wrap", sm ? "gap-x-3 gap-y-1.5" : "gap-x-5 gap-y-3")}>
              {/* Rating */}
              {selectedPlace.rating !== null && (
                <div className={cn("flex items-center", sm ? "gap-1" : "gap-1.5")}>
                  <Star className={cn("text-amber-500 fill-amber-500", sm ? "size-3" : "size-4")} />
                  <span
                    className={cn("font-medium text-card-foreground", sm ? "text-xs" : "text-base")}
                  >
                    {selectedPlace.rating}
                  </span>
                  {selectedPlace.ratingCount > 0 && (
                    <span className={cn("text-muted-foreground", sm ? "text-[10px]" : "text-sm")}>
                      ({selectedPlace.ratingCount.toLocaleString()})
                    </span>
                  )}
                </div>
              )}

              {/* Open Status */}
              {selectedPlace.isOpen !== null && (
                <div className={cn("flex items-center", sm ? "gap-1" : "gap-1.5")}>
                  <Clock className={cn("text-muted-foreground", sm ? "size-2.5" : "size-3.5")} />
                  <span
                    className={cn(
                      "font-medium",
                      sm ? "text-xs" : "text-base",
                      selectedPlace.isOpen
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive",
                    )}
                  >
                    {selectedPlace.isOpen ? "Open now" : "Closed"}
                  </span>
                </div>
              )}

              {/* Phone */}
              {selectedPlace.phone && (
                <div className={cn("flex items-center", sm ? "gap-1" : "gap-1.5")}>
                  <Phone className={cn("text-muted-foreground", sm ? "size-2.5" : "size-3.5")} />
                  <a
                    href={`tel:${selectedPlace.phone}`}
                    className={cn(
                      "text-card-foreground hover:underline",
                      sm ? "text-xs" : "text-base",
                    )}
                  >
                    {selectedPlace.phone}
                  </a>
                </div>
              )}

              {/* Website */}
              {selectedPlace.website && (
                <div className={cn("flex items-center", sm ? "gap-1" : "gap-1.5")}>
                  <Globe className={cn("text-muted-foreground", sm ? "size-2.5" : "size-3.5")} />
                  <a
                    href={selectedPlace.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "text-card-foreground hover:underline truncate",
                      sm ? "text-xs max-w-32" : "text-base max-w-48",
                    )}
                  >
                    {new URL(selectedPlace.website).hostname}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Place Type tags – hidden in sm variant */}
          {!sm && selectedPlace.primaryTypeDisplayName && (
            <div className="border-t border-border px-5 py-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-sm">
                  {selectedPlace.primaryTypeDisplayName}
                </Badge>
                {selectedPlace.types.slice(0, 4).map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {formatPlaceType(type)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
