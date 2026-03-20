import { NextRequest, NextResponse } from "next/server";

const getApiKey = () =>
  process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

function parseIntParam(value: string | null) {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return null;
  return n;
}

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  const maxHeightPx = parseIntParam(request.nextUrl.searchParams.get("maxHeightPx"));
  const maxWidthPx = parseIntParam(request.nextUrl.searchParams.get("maxWidthPx"));

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  if (!maxHeightPx && !maxWidthPx) {
    return NextResponse.json(
      { error: "Provide at least one of maxHeightPx or maxWidthPx" },
      { status: 400 },
    );
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Google Places API key" }, { status: 500 });
  }

  try {
    // Basic sanity checks to reduce accidental misuse.
    if (!name.startsWith("places/") || !name.includes("/photos/")) {
      return NextResponse.json({ error: "Invalid photo name resource" }, { status: 400 });
    }

    const params = [
      `key=${encodeURIComponent(apiKey)}`,
      "skipHttpRedirect=true",
      ...(maxHeightPx ? [`maxHeightPx=${maxHeightPx}`] : []),
      ...(maxWidthPx ? [`maxWidthPx=${maxWidthPx}`] : []),
    ].join("&");

    const googleResp = await fetch(
      `https://places.googleapis.com/v1/${name}/media?${params}`,
      { method: "GET" },
    );

    if (!googleResp.ok) {
      const errorText = await googleResp.text().catch(() => "");
      return NextResponse.json(
        { error: "Failed to fetch place photo", details: errorText },
        { status: googleResp.status },
      );
    }

    const data = (await googleResp.json()) as { photoUri?: string };
    if (!data.photoUri) {
      return NextResponse.json({ error: "Missing photoUri in response" }, { status: 500 });
    }

    return NextResponse.redirect(data.photoUri);
  } catch (error) {
    console.error("Place photo error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

