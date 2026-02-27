import { headers } from "next/headers";

/**
 * Get country code from request (e.g. Vercel's x-vercel-ip-country).
 * Returns null if not available (e.g. local dev).
 */
export async function getGeolocation(): Promise<string | null> {
  const h = await headers();
  const country = h.get("x-vercel-ip-country");
  return country;
}
