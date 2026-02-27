"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

const features = [
  {
    title: "Premium Valet Service",
    description: "White-glove valet at top restaurants, nightclubs, and venues across the city.",
    image: "/home/card-valet.jpg",
  },
  {
    title: "Secure Private Garages",
    description: "Climate-controlled, surveilled parking in exclusive off-street facilities.",
    image: "/home/card-garage.jpg",
  },
  {
    title: "Instant Reservations",
    description: "Book a spot in seconds through our app. Real-time availability, zero hassle.",
    image: "/home/card-app.jpg",
  },
  {
    title: "City-Wide Coverage",
    description: "Premium locations in every major nightlife and dining district.",
    image: "/home/card-city.jpg",
  },
];

const stats = [
  { value: "12,000+", label: "Cars parked monthly" },
  { value: "85+", label: "Premium locations" },
  { value: "99%", label: "On-time availability" },
  { value: "$0", label: "Damage claims filed" },
];

export default function Home() {
  return (
    <main>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-lg">
        <div className="flex items-center justify-between px-6 py-4 lg:px-10">
          <nav className="hidden items-center gap-8 md:flex">
            {/* <Link
              href="#about"
              className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="#benefits"
              className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              Benefits
            </Link>
            <Link
              href="#locations"
              className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              Locations
            </Link> */}
          </nav>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="text-lg font-semibold tracking-tight text-foreground">Carrezo</span>
          </Link>

          <div className="flex items-center gap-4 ml-auto">
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full border border-foreground bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Apply Now
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/book"
                className="rounded-full border border-foreground bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-transparent hover:text-foreground"
              >
                Book
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      <section className="relative pt-16">
        <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
          <div className="relative flex-1 overflow-hidden" data-hero-fallback>
            <div className="relative h-full min-h-[400px] w-full bg-muted">
              <Image
                src="/home/hero-car.jpg"
                alt="Exotic car parked on a city street"
                fill
                className="object-cover"
                priority
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const wrapper = target.closest("[data-hero-fallback]");
                  const fallback = wrapper?.querySelector(
                    "[data-hero-gradient]",
                  ) as HTMLElement | null;
                  const img = wrapper?.querySelector("img") as HTMLElement | null;
                  if (img) img.style.display = "none";
                  if (fallback) fallback.style.display = "block";
                }}
              />
              <div
                data-hero-gradient
                className="absolute inset-0 bg-gradient-to-br from-[#1a1620] via-[#2d2435] to-[#1a1620]"
                style={{ display: "none" }}
                aria-hidden
              />
            </div>
            <div className="absolute inset-0 bg-black/55" />
            <div className="relative z-10 flex h-full flex-col justify-end p-8 pb-16 lg:p-12 lg:pb-20">
              <div className="flex flex-col gap-3">
                <h1 className="text-5xl font-bold leading-none tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
                  Hit the town
                </h1>
                <p className="max-w-md text-lg font-light tracking-wide text-white/80 md:text-xl">
                  Reserve an off-street spot for your exotic car
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center bg-background p-8 lg:p-12">
            <div className="flex flex-col gap-4 text-left">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                PARKING, REIMAGINED
              </p>
              <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Built for car lovers, by car lovers.
              </h2>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="bg-background px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative flex flex-col justify-end overflow-hidden rounded-xl"
              >
                <div className="relative aspect-[3/4] bg-muted">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="mb-1 text-lg font-semibold leading-snug text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/70">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-background px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
            A network like no other.
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-8"
              >
                <span className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
