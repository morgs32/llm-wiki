import { getGeolocation } from "@/utils/get-geolocation";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_GOOGLE_PLACES_API_KEY", data: null },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url, `http://${req.headers?.get("host") ?? "localhost"}`);
  const country = await getGeolocation();
  const input = searchParams.get("input");
  const locationType = searchParams.get("locationType"); // "cities" = locality only
  const url = "https://places.googleapis.com/v1/places:autocomplete";

  const primaryTypes =
    locationType === "cities"
      ? ["locality"]
      : ["street_address", "subpremise", "route", "street_number", "landmark"];

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input: input ?? "",
        includedPrimaryTypes: primaryTypes,
        includedRegionCodes: [country ?? "US"],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const suggestions = data.suggestions ?? [];

    return NextResponse.json({ data: suggestions, error: null });
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error);
    return NextResponse.json({ error: String(error), data: null });
  }
}
