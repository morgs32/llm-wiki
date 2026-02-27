"use client";

import * as React from "react";

type ThemeConfigContextValue = {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
};

const ThemeConfigContext = React.createContext<ThemeConfigContextValue | undefined>(undefined);

export function ActiveThemeProvider({
  children,
  defaultTheme = "default",
}: {
  children: React.ReactNode;
  defaultTheme?: string;
}) {
  const [activeTheme, setActiveTheme] = React.useState(defaultTheme);
  return (
    <ThemeConfigContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeConfigContext.Provider>
  );
}

export function useThemeConfig(): ThemeConfigContextValue {
  const context = React.useContext(ThemeConfigContext);
  if (context === undefined) {
    throw new Error("useThemeConfig must be used within an ActiveThemeProvider");
  }
  return context;
}
