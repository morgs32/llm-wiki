import { NextRequest, NextResponse } from "next/server";

const getApiKey = () =>
  process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const locationLatRaw = request.nextUrl.searchParams.get("locationLat");
  const locationLngRaw = request.nextUrl.searchParams.get("locationLng");
  const radiusMetersRaw = request.nextUrl.searchParams.get("radiusMeters");

  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Google Places API key" }, { status: 500 });
  }

  try {
    const locationLat = locationLatRaw ? Number.parseFloat(locationLatRaw) : NaN;
    const locationLng = locationLngRaw ? Number.parseFloat(locationLngRaw) : NaN;
    const radiusMeters = radiusMetersRaw ? Number.parseFloat(radiusMetersRaw) : NaN;

      // Google Places API validates the locationBias circle radius:
      // it must be between 0 and 50,000 meters.
      const radiusMetersClamped = Number.isFinite(radiusMeters)
        ? Math.max(0, Math.min(radiusMeters, 50_000))
        : NaN;

    const shouldApplyLocationBias =
      Number.isFinite(locationLat) &&
      Number.isFinite(locationLng) &&
        Number.isFinite(radiusMetersClamped) &&
        radiusMetersClamped > 0;

    const locationBias = shouldApplyLocationBias
      ? {
          circle: {
            center: { latitude: locationLat, longitude: locationLng },
              radius: radiusMetersClamped,
          },
        }
      : undefined;

    const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input: query,
        includedPrimaryTypes: ["establishment"],
        ...(locationBias ? { locationBias } : {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Autocomplete API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch suggestions" },
        { status: response.status },
      );
    }

    const data = await response.json();

    const suggestions = (data.suggestions || [])
      .filter((s: Record<string, unknown>) => s.placePrediction)
      .map(
        (s: {
          placePrediction: {
            placeId: string;
            text: { text: string };
            structuredFormat?: {
              mainText: { text: string };
              secondaryText?: { text: string };
            };
            types?: string[];
          };
        }) => ({
          placeId: s.placePrediction.placeId,
          description: s.placePrediction.text?.text || "",
          mainText: s.placePrediction.structuredFormat?.mainText?.text || "",
          secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text || "",
          types: s.placePrediction.types || [],
        }),
      );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
