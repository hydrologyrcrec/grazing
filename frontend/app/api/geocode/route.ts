import { NextRequest, NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/auth/server";
import { ApiError } from "@/lib/auth/errors";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  boundingbox?: [string, string, string, string];
};

export async function GET(request: NextRequest) {
  try {
    await requireActiveUser();
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 401 },
      );
    }

    console.error("Authentication check failed", error);

    return NextResponse.json(
      { error: "Unable to verify authentication." },
      { status: 500 },
    );
  }

  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 3) {
    return NextResponse.json(
      { error: "Enter at least 3 characters." },
      { status: 400 },
    );
  }

  if (query.length > 256 || query.includes(";")) {
    return NextResponse.json(
      { error: "Enter a shorter valid address." },
      { status: 400 },
    );
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");

  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "1");

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
        "User-Agent": "GrazingRanchMap/1.0 (replace-with-your-contact-email)",
      },
      next: {
        revalidate: 86400,
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoder returned ${response.status}`);
    }

    const data = (await response.json()) as NominatimResult[];

    return NextResponse.json(
      data.map((item) => ({
        lat: Number(item.lat),
        lng: Number(item.lon),
        label: item.display_name,
        boundingBox: item.boundingbox?.map(Number),
      })),
    );
  } catch (error) {
    console.error("Address lookup failed", error);

    return NextResponse.json(
      { error: "Address search is unavailable." },
      { status: 502 },
    );
  }
}
