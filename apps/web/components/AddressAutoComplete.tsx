"use client";

import { FormMessages } from "@/components/form-messages";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { fetcher } from "@/utils/fetcher";
import { cn } from "@/lib/utils";
import { Delete, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import z from "zod";

export interface AddressType {
  address1: string;
  address2: string;
  formattedAddress: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
}

interface AddressAutoCompleteProps {
  address: AddressType;
  setAddress: (address: AddressType) => void;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
  showInlineError?: boolean;
  placeholder?: string;
  /** When true, autocomplete only suggests cities (locality). Default false. */
  searchOnlyCities?: boolean;
  className?: string;
}

export default function AddressAutoComplete(props: AddressAutoCompleteProps) {
  const {
    address,
    setAddress,
    showInlineError = true,
    searchInput,
    setSearchInput,
    placeholder,
    searchOnlyCities = false,
    className,
  } = props;

  const [selectedPlaceId, setSelectedPlaceId] = useState("");

  const { data, isLoading } = useSWR(
    selectedPlaceId === ""
      ? null
      : `/api/address/place?placeId=${encodeURIComponent(selectedPlaceId)}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  useEffect(() => {
    if (data?.data?.address) {
      setAddress(data.data.address as AddressType);
    }
  }, [data, setAddress]);

  return (
    <>
      {selectedPlaceId !== "" || address.formattedAddress ? (
        <div className="flex gap-2">
          <Input value={address.formattedAddress} readOnly className={cn("flex-1", className)} />
          <Button
            onClick={() => {
              setSelectedPlaceId("");
              setAddress({
                address1: "",
                address2: "",
                formattedAddress: "",
                city: "",
                region: "",
                postalCode: "",
                country: "",
                lat: 0,
                lng: 0,
              });
            }}
            size="icon"
            variant="outline"
            className="shrink-0"
          >
            <Delete className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <AddressAutoCompleteInput
          selectedPlaceId={selectedPlaceId}
          setSelectedPlaceId={setSelectedPlaceId}
          showInlineError={showInlineError}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          placeholder={placeholder}
          address={address}
          setAddress={setAddress}
          searchOnlyCities={searchOnlyCities}
          className={className}
        />
      )}
    </>
  );
}

interface CommonProps {
  selectedPlaceId: string;
  setSelectedPlaceId: (placeId: string) => void;
  showInlineError?: boolean;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
  placeholder?: string;
  address: AddressType;
  setAddress: (address: AddressType) => void;
  searchOnlyCities?: boolean;
  className?: string;
}

function AddressAutoCompleteInput(props: CommonProps) {
  const {
    setSelectedPlaceId,
    selectedPlaceId,
    showInlineError,
    searchInput,
    setSearchInput,
    placeholder,
    searchOnlyCities = false,
    className,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      close();
    }
  };

  const debouncedSearchInput = useDebounce(searchInput, 500);

  const { data, isLoading } = useSWR(
    debouncedSearchInput.trim()
      ? `/api/address/autocomplete?input=${encodeURIComponent(debouncedSearchInput)}${searchOnlyCities ? "&locationType=cities" : ""}`
      : null,
    fetcher,
  );

  const rawPredictions = data?.data ?? [];
  const predictions = Array.isArray(rawPredictions) ? rawPredictions : [];

  return (
    <Command
      shouldFilter={false}
      onKeyDown={handleKeyDown}
      className="relative overflow-visible bg-transparent"
    >
      <Input
        placeholder={placeholder ?? "Search for an address..."}
        value={searchInput}
        onFocus={open}
        onBlur={() => setTimeout(close, 200)}
        onChange={(e) => setSearchInput(e.target.value)}
        className={cn("w-full", className)}
      />
      {searchInput !== "" && !isOpen && !selectedPlaceId && showInlineError && (
        <FormMessages
          messages="Please select an address from the dropdown"
          type="error"
          className="mt-1"
        />
      )}
      {isOpen && (
        <CommandList className="absolute top-full z-[100] mt-1 max-h-[300px] w-full overflow-auto rounded-md border bg-popover shadow-md">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {predictions.map(
                (prediction: {
                  placePrediction?: {
                    placeId: string;
                    place?: string;
                    text?: { text: string };
                  };
                }) => {
                  const p = prediction.placePrediction;
                  if (!p) return null;
                  const placeId = p.place ?? p.placeId;
                  const text = p.text?.text ?? "";
                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSearchInput("");
                        setSelectedPlaceId(placeId);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSearchInput("");
                          setSelectedPlaceId(placeId);
                        }
                      }}
                      className="flex cursor-pointer select-none flex-col gap-0.5 rounded-md p-2 px-3 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                      key={placeId}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {text}
                    </div>
                  );
                },
              )}
              {!isLoading && predictions.length === 0 && (
                <CommandEmpty>
                  {searchInput === "" ? "Please enter an address" : "No address found"}
                </CommandEmpty>
              )}
            </>
          )}
        </CommandList>
      )}
    </Command>
  );
} /**
 * Checks if the autocomplete address is valid.
 */

export const isValidAutocomplete = (address: AddressType, searchInput: string) => {
  if (searchInput.trim() === "") {
    return true;
  }

  const AddressSchema = z.object({
    address1: z.string().min(1, "Address line 1 is required"),
    address2: z.string().optional(),
    formattedAddress: z.string().min(1, "Formatted address is required"),
    city: z.string().min(1, "City is required"),
    region: z.string().min(1, "Region is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    lat: z.number().nonnegative(),
    lng: z.number().nonnegative(),
  });

  const result = AddressSchema.safeParse(address);
  return result.success;
};
