import { NextRequest, NextResponse } from "next/server";
import { LOCAL_BRANDS, LocalBrand } from "@/lib/localBrands";

export interface LocalBrandResult {
  brandId: string;
  brandName: string;
  brandNameAr: string;
  brandColor: string;
  brandCategory: string;
  brandWebsite: string;
  productName: string;
  price: number;
  currency: string;
  imageUrl?: string;
  productUrl?: string;
  inStock?: boolean;
}

const UA_MOBILE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

async function fetchBrandShopify(
  brand: LocalBrand,
  query: string
): Promise<LocalBrandResult[]> {
  try {
    const res = await fetch(
      `${brand.website}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=12`,
      {
        headers: {
          "User-Agent": UA_MOBILE,
          Accept: "application/json",
          Referer: brand.website,
        },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 600 },
      }
    );
    if (!res.ok) return [];
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) return [];
    const data = await res.json();

    const products: unknown[] =
      data?.resources?.results?.products ||
      data?.results ||
      data?.products ||
      [];
    if (!Array.isArray(products) || products.length === 0) return [];

    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 1);

    return (products as Array<Record<string, unknown>>)
      .slice(0, 12)
      .map((p) => {
        const variants = (p.variants as Array<Record<string, unknown>>) ?? [];
        const rawPrice = Number(variants[0]?.price ?? p.price ?? 0);
        // Shopify returns price in cents when > 1000, otherwise in EGP directly
        const price = rawPrice > 10000 ? rawPrice / 100 : rawPrice;

        const handle = p.handle as string | undefined;

        // Get best available image
        let imageUrl: string | undefined;
        const featuredImg = p.featured_image;
        if (typeof featuredImg === "string" && featuredImg.startsWith("http")) {
          imageUrl = featuredImg;
        } else if (featuredImg && typeof featuredImg === "object") {
          imageUrl =
            (featuredImg as Record<string, unknown>).url as string | undefined;
        }
        if (!imageUrl && variants[0]) {
          const varImg = (variants[0].featured_image as Record<string, unknown>)
            ?.url as string | undefined;
          if (varImg) imageUrl = varImg;
        }
        // Add _800x800 size hint to Shopify CDN URLs if missing
        if (imageUrl && imageUrl.includes("cdn.shopify.com") && !imageUrl.includes("_")) {
          imageUrl = imageUrl.replace(/(\.[a-z]+)(\?|$)/, "_800x800$1$2");
        }

        return {
          brandId: brand.id,
          brandName: brand.name,
          brandNameAr: brand.nameAr,
          brandColor: brand.color,
          brandCategory: brand.category,
          brandWebsite: brand.website,
          productName: (p.title as string) || query,
          price,
          currency: "EGP",
          imageUrl,
          productUrl: handle
            ? `${brand.website}/products/${handle}`
            : `${brand.website}/search?type=product&q=${encodeURIComponent(query)}`,
          inStock: p.available !== false,
        } as LocalBrandResult;
      })
      .filter((r) => {
        if (r.price <= 0) return false;
        if (queryWords.length === 0) return true;
        const name = r.productName.toLowerCase();
        return queryWords.some((w) => name.includes(w));
      });
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  const categoryFilter = req.nextUrl.searchParams.get("category") || "all";
  const brandFilter = req.nextUrl.searchParams.get("brand") || "all";

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }
  const q = query.trim();

  // Filter brands by category/id if requested
  let brandsToSearch = LOCAL_BRANDS.filter((b) => b.platform === "shopify");
  if (categoryFilter !== "all") {
    brandsToSearch = brandsToSearch.filter((b) => b.category === categoryFilter);
  }
  if (brandFilter !== "all") {
    brandsToSearch = brandsToSearch.filter((b) => b.id === brandFilter);
  }

  const settled = await Promise.allSettled(
    brandsToSearch.map((brand) => fetchBrandShopify(brand, q))
  );

  const all: LocalBrandResult[] = settled
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<LocalBrandResult[]>).value);

  // Deduplicate
  const seen = new Set<string>();
  const deduped = all.filter((r) => {
    const key = `${r.brandId}-${r.productName.slice(0, 25).toLowerCase()}-${Math.round(r.price / 5)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => a.price - b.price);

  // Group by brand for the response
  const byBrand = brandsToSearch
    .map((brand) => ({
      brand,
      results: deduped.filter((r) => r.brandId === brand.id),
    }))
    .filter((g) => g.results.length > 0);

  return NextResponse.json({
    query: q,
    results: deduped,
    byBrand,
    count: deduped.length,
    brandsSearched: brandsToSearch.length,
    brandsWithResults: byBrand.length,
    timestamp: new Date().toISOString(),
  });
}
