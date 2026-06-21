import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache to reduce Unsplash API calls
const CACHE: Record<string, string> = {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return new NextResponse("Missing query parameter", { status: 400 });
  }

  const cacheKey = query.toLowerCase().trim();

  // Return from in-memory cache if available
  if (CACHE[cacheKey]) {
    return NextResponse.redirect(CACHE[cacheKey]);
  }

  const clientKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (clientKey) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + " travel")}&client_id=${clientKey}&per_page=1`,
        { next: { revalidate: 86400 } } // Cache in Next.js data cache for 24 hours
      );
      
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const url = data.results[0].urls.small || data.results[0].urls.regular;
          if (url) {
            CACHE[cacheKey] = url;
            return NextResponse.redirect(url);
          }
        }
      }
    } catch (e) {
      console.error("Unsplash search failed, falling back to LoremFlickr:", e);
    }
  }

  // Fallback to LoremFlickr if Unsplash is rate-limited or fails
  const fallbackUrl = `https://loremflickr.com/600/400/travel,${encodeURIComponent(query)}`;
  return NextResponse.redirect(fallbackUrl);
}
