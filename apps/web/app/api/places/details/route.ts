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
          "id,displayName,formattedAddress,businessStatus,types,primaryType,primaryTypeDisplayName,nationalPhoneNumber,websiteUri,rating,userRatingCount,currentOpeningHours,location",
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
      },
    });
  } catch (error) {
    console.error("Place Details error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
