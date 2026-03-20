import { NextRequest, NextResponse } from "next/server";

const getApiKey = () =>
  process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Google Places API key" }, { status: 500 });
  }

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "id,displayName,formattedAddress,businessStatus,types,primaryType,primaryTypeDisplayName,nationalPhoneNumber,websiteUri,rating,userRatingCount,currentOpeningHours,location,photos",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Place Details API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch place details" },
        { status: response.status },
      );
    }

    const data = await response.json();

    const photoNames: string[] = Array.isArray(data.photos)
      ? data.photos
          .map((p: { name?: string | null }) => p.name)
          .filter((n: string | null | undefined): n is string => Boolean(n))
      : [];

    // Convert photo resource names into short-lived thumbnail URIs.
    // Google requires a separate call per photo, and the `photoUri` is returned only
    // by the Place Photos endpoint.
    const photoUris = await Promise.all(
      photoNames.slice(0, 9).map(async (photoName) => {
        try {
          const photoResp = await fetch(
            `https://places.googleapis.com/v1/${photoName}/media?key=${encodeURIComponent(
              apiKey,
            )}&maxHeightPx=200&maxWidthPx=200&skipHttpRedirect=true`,
          );

          if (!photoResp.ok) return null;
          const photoData = await photoResp.json();
          return typeof photoData?.photoUri === "string" ? photoData.photoUri : null;
        } catch {
          return null;
        }
      }),
    );

    return NextResponse.json({
      place: {
        id: data.id,
        name: data.displayName?.text || "",
        address: data.formattedAddress || "",
        businessStatus: data.businessStatus || "UNKNOWN",
        types: data.types || [],
        primaryType: data.primaryType || "",
        primaryTypeDisplayName: data.primaryTypeDisplayName?.text || "",
        phone: data.nationalPhoneNumber || "",
        website: data.websiteUri || "",
        rating: data.rating || null,
        ratingCount: data.userRatingCount || 0,
        location: data.location || null,
        isOpen: data.currentOpeningHours?.openNow ?? null,
        photoUrls: photoUris.filter((u): u is string => typeof u === "string" && u.length > 0),
      },
    });
  } catch (error) {
    console.error("Place Details error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
