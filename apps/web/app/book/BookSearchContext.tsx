"use client";

import * as React from "react";

export interface SearchMarker {
  id: string;
  name: string;
  rating: number;
  lng: number;
  lat: number;
  count: number;
}

const BookSearchContext = React.createContext<{
  markers: SearchMarker[];
  setMarkers: (m: SearchMarker[]) => void;
}>({
  markers: [],
  setMarkers: () => {},
});

export function BookSearchProvider({ children }: { children: React.ReactNode }) {
  const [markers, setMarkers] = React.useState<SearchMarker[]>([]);
  const value = React.useMemo(() => ({ markers, setMarkers }), [markers]);
  return <BookSearchContext.Provider value={value}>{children}</BookSearchContext.Provider>;
}

export function useBookSearch() {
  return React.useContext(BookSearchContext);
}
