import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { cn } from "../lib/utils";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Carrezo",
  description: "Carrezo is a platform for car parking and valet services.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(GeistSans.variable, GeistMono.variable, montserrat.variable)}>
      <body className={cn(GeistSans.className, "bg-background text-foreground antialiased")}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
