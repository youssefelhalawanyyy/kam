import { NextRequest, NextResponse } from "next/server";
import { SHOPIFY_BRANDS } from "@/lib/localBrands";

export interface MarketPriceResult {
  store: string;
  storeAr: string;
  productName: string;
  price: number;
  currency: string;
  imageUrl?: string;
  productUrl?: string;
  storeColor: string;
  inStock?: boolean;
  brand?: string;
  isLocalBrand?: boolean;
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const UA_MOBILE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

/** Extract balanced JSON array/object starting at html[start] */
function extractJsonBlock(html: string, start: number): string | null {
  let depth = 0;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0) return html.slice(start, i + 1);
    }
  }
  return null;
}

// ── 1. Jumia Egypt ─────────────────────────────────────────────────────────────
// Confirmed ✅ — embeds "products":[...] JSON server-side in HTML
async function fetchJumia(query: string): Promise<MarketPriceResult[]> {
  try {
    const res = await fetch(
      `https://www.jumia.com.eg/catalog/?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": UA,
          Accept: "text/html,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
          Referer: "https://www.jumia.com.eg/",
        },
        signal: AbortSignal.timeout(12000),
        next: { revalidate: 600 },
      }
    );
    if (!res.ok) return [];
    const html = await res.text();

    const marker = '"products":';
    const idx = html.indexOf(marker);
    if (idx === -1) return [];
    const arrStart = html.indexOf("[", idx + marker.length);
    if (arrStart === -1) return [];
    const jsonStr = extractJsonBlock(html, arrStart);
    if (!jsonStr) return [];

    const products: Array<Record<string, unknown>> = JSON.parse(jsonStr);
    return products
      .slice(0, 20)
      .map((p) => {
        const pricesObj = p.prices as Record<string, unknown> | undefined;
        const rawPrice = parseFloat(
          String(pricesObj?.rawPrice ?? pricesObj?.price ?? "0").replace(/[^0-9.]/g, "")
        );
        const relUrl = p.url as string | undefined;
        return {
          store: "Jumia Egypt",
          storeAr: "جوميا مصر",
          productName: (p.displayName as string) || (p.name as string) || query,
          price: rawPrice,
          currency: "EGP",
          imageUrl: (p.image as string) || undefined,
          productUrl: relUrl
            ? `https://www.jumia.com.eg${relUrl.startsWith("/") ? relUrl : "/" + relUrl}`
            : `https://www.jumia.com.eg/catalog/?q=${encodeURIComponent(query)}`,
          storeColor: "#E07F00",
          inStock: p.isBuyable !== false,
          brand: (p.brand as string) || undefined,
        } as MarketPriceResult;
      })
      .filter((r) => r.price > 0);
  } catch {
    return [];
  }
}

// ── 2. Amazon Egypt ────────────────────────────────────────────────────────────
// Confirmed ✅ — HTML with product images (alt=title), EGP prices, /dp/ links
async function fetchAmazon(query: string): Promise<MarketPriceResult[]> {
  try {
    const res = await fetch(
      `https://www.amazon.eg/s?k=${encodeURIComponent(query)}&ref=nb_sb_noss`,
      {
        headers: {
          "User-Agent": UA_MOBILE,
          Accept: "text/html,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://www.amazon.eg/",
        },
        signal: AbortSignal.timeout(12000),
        next: { revalidate: 600 },
      }
    );
    if (!res.ok) return [];
    const html = await res.text();

    const results: MarketPriceResult[] = [];
    const sections = html.split('data-component-type="s-product-image"');

    for (const sec of sections.slice(1)) {
      const titleM = sec.match(/alt="([^"]{10,150})"/);
      const imgM = sec.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
      const dpM = sec.match(/href="(\/[^\s"]*?\/dp\/([A-Z0-9]{10})[^\s"]*)"/);
      const priceM = sec.match(/EGP\s*([\d,]+(?:\.\d+)?)/);

      if (titleM && priceM && dpM) {
        const price = parseFloat(priceM[1].replace(/,/g, ""));
        if (price < 5 || price > 100000) continue;
        results.push({
          store: "Amazon Egypt",
          storeAr: "أمازون مصر",
          productName: titleM[1],
          price,
          currency: "EGP",
          imageUrl: imgM ? imgM[1] : undefined,
          productUrl: `https://www.amazon.eg${dpM[1]}`.replace(/&amp;/g, "&"),
          storeColor: "#FF9900",
          inStock: true,
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

// ── Generic Magento GraphQL fetcher ────────────────────────────────────────────
async function fetchMagento(
  storeName: string,
  storeAr: string,
  color: string,
  graphqlUrl: string,
  baseUrl: string,
  origin: string,
  query: string
): Promise<MarketPriceResult[]> {
  const safeQuery = query.replace(/"/g, " ");
  const gql = {
    query: `{
      products(search: "${safeQuery}", pageSize: 12) {
        items {
          name
          url_key
          url_rewrites { url }
          stock_status
          price_range {
            minimum_price {
              final_price { value currency }
            }
          }
          small_image { url }
        }
      }
    }`,
  };
  try {
    const res = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": UA,
        Origin: origin,
        Referer: `${origin}/`,
      },
      body: JSON.stringify(gql),
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const gqlData = (data as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
    const gqlProducts = gqlData?.products as Record<string, unknown> | undefined;
    const items: Array<Record<string, unknown>> = (gqlProducts?.items as Array<Record<string, unknown>>) ?? [];
    if (!Array.isArray(items)) return [];

    // Relevance filter: at least one query word must appear in the product name
    const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    return items
      .map((p) => {
        const priceRange = p.price_range as Record<string, unknown> | undefined;
        const minPriceObj = (priceRange?.minimum_price as Record<string, unknown>)
          ?.final_price as Record<string, unknown> | undefined;
        const price = Math.round(Number(minPriceObj?.value ?? 0) * 100) / 100;
        const imgObj = p.small_image as Record<string, unknown> | undefined;
        const rewrites = (p.url_rewrites as Array<Record<string, unknown>>) ?? [];
        // Pick shortest rewrite URL (closest to root = canonical)
        const urlSlug = rewrites
          .map((r) => r.url as string)
          .sort((a, b) => a.length - b.length)[0] ?? (p.url_key as string);
        return {
          store: storeName,
          storeAr,
          productName: (p.name as string) || query,
          price,
          currency: "EGP",
          imageUrl: (imgObj?.url as string) || undefined,
          productUrl: urlSlug
            ? `${baseUrl}/${urlSlug}`
            : `${baseUrl}/catalogsearch/result/?q=${encodeURIComponent(query)}`,
          storeColor: color,
          inStock: p.stock_status === "IN_STOCK",
        } as MarketPriceResult;
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

// ── 4. Carrefour Egypt ─────────────────────────────────────────────────────────
// May work from Vercel (blocked locally)
async function fetchCarrefour(query: string): Promise<MarketPriceResult[]> {
  try {
    const res = await fetch(
      `https://www.carrefouregypt.com/api/2.0/page/components/search?query=${encodeURIComponent(query)}&pageSize=12&lang=en&currency=EGP&areaCode=EG1&sortBy=relevance`,
      {
        headers: {
          "User-Agent": UA,
          Accept: "application/json",
          Referer: "https://www.carrefouregypt.com/",
          Origin: "https://www.carrefouregypt.com",
        },
        signal: AbortSignal.timeout(9000),
        next: { revalidate: 600 },
      }
    );
    if (!res.ok) return [];
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) return [];
    const data = await res.json();

    const products: unknown[] =
      data?.components?.[0]?.products || data?.products?.results || data?.results || [];
    if (!Array.isArray(products) || products.length === 0) return [];

    return (products as Array<Record<string, unknown>>)
      .slice(0, 12)
      .map((p) => {
        const priceObj = (p.price as Record<string, unknown>) ?? {};
        const price = Number(
          priceObj.value ?? String(priceObj.formattedValue ?? "0").replace(/[^\d.]/g, "")
        );
        const imgObj = p.thumbnail as Record<string, unknown> | string | undefined;
        const imageUrl =
          typeof imgObj === "string"
            ? imgObj
            : ((imgObj as Record<string, unknown>)?.url as string | undefined);
        return {
          store: "Carrefour Egypt",
          storeAr: "كارفور مصر",
          productName: (p.name as string) || query,
          price,
          currency: "EGP",
          imageUrl: imageUrl
            ? imageUrl.startsWith("http")
              ? imageUrl
              : `https://www.carrefouregypt.com${imageUrl}`
            : undefined,
          productUrl: p.url
            ? `https://www.carrefouregypt.com${p.url}`
            : `https://www.carrefouregypt.com/mafegy/en/c/FEGY_SearchResults?q=${encodeURIComponent(query)}`,
          storeColor: "#0055A6",
          inStock: p.stock !== "outOfStock",
        } as MarketPriceResult;
      })
      .filter((r) => r.price > 0);
  } catch {
    return [];
  }
}

// ── 5. Shopify stores generic ──────────────────────────────────────────────────
// May work from Vercel even if geo-blocked locally
async function fetchShopify(
  storeName: string,
  storeAr: string,
  color: string,
  baseUrl: string,
  query: string
): Promise<MarketPriceResult[]> {
  try {
    const res = await fetch(
      `${baseUrl}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=8`,
      {
        headers: { "User-Agent": UA_MOBILE, Accept: "application/json", Referer: baseUrl },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 600 },
      }
    );
    if (!res.ok) return [];
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) return [];
    const data = await res.json();
    const products: unknown[] =
      data?.resources?.results?.products || data?.results || data?.products || [];
    if (!Array.isArray(products) || products.length === 0) return [];

    return (products as Array<Record<string, unknown>>)
      .slice(0, 8)
      .map((p) => {
        const variants = (p.variants as Array<Record<string, unknown>>) ?? [];
        const rawPrice = Number(variants[0]?.price ?? p.price ?? 0);
        const price = rawPrice > 1000 ? rawPrice / 100 : rawPrice;
        const handle = p.handle as string | undefined;
        return {
          store: storeName,
          storeAr,
          productName: (p.title as string) || query,
          price,
          currency: "EGP",
          imageUrl:
            (p.featured_image as string) ||
            ((variants[0]?.featured_image as Record<string, unknown>)?.url as string | undefined),
          productUrl: handle
            ? `${baseUrl}/products/${handle}`
            : `${baseUrl}/search?type=product&q=${encodeURIComponent(query)}`,
          storeColor: color,
          inStock: p.available !== false,
        } as MarketPriceResult;
      })
      .filter((r) => r.price > 0);
  } catch {
    return [];
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }
  const q = query.trim();

  // Local brand fetches — tag results with isLocalBrand
  const localBrandFetches = SHOPIFY_BRANDS.map((brand) =>
    fetchShopify(brand.name, brand.nameAr, brand.color, brand.website, q).then((results) =>
      results.map((r) => ({ ...r, isLocalBrand: true }))
    )
  );

  const settled = await Promise.allSettled([
    // Confirmed working ✅
    fetchJumia(q),
    fetchAmazon(q),
    fetchMagento("Hyper One", "هايبر ون", "#8B0000",
      "https://mcprod.hyperone.com.eg/graphql", "https://www.hyperone.com.eg",
      "https://www.hyperone.com.eg", q),
    fetchMagento("Gourmet Egypt", "جورميه مصر", "#C8960C",
      "https://gourmetegypt.com/graphql", "https://gourmetegypt.com",
      "https://gourmetegypt.com", q),
    // May work from Vercel production servers
    fetchCarrefour(q),
    fetchShopify("Kheir Zaman", "خير زمان", "#E31837", "https://www.kheirzamanonline.com", q),
    fetchShopify("Seoudi Online", "سعودي أون لاين", "#00843D", "https://www.seoudionline.com", q),
    fetchShopify("Metro Market", "مترو ماركت", "#FF6B00", "https://www.metro-egypt.com", q),
    fetchShopify("Spinneys Egypt", "سبينيس", "#003087", "https://www.spinneys.com", q),
    fetchShopify("Seif Pharmacy", "صيدلية سيف", "#0066CC", "https://www.seifpharmacy.com", q),
    fetchShopify("Saydalia", "صيدلية سيداليا", "#009B3A", "https://saydalia.com", q),
    // Additional Egyptian supermarkets
    fetchMagento("Alfa Market", "ألفا ماركت", "#E31837",
      "https://alfamarket.com.eg/graphql", "https://alfamarket.com.eg",
      "https://alfamarket.com.eg", q),
    fetchMagento("Lulu Egypt", "لولو مصر", "#EF7C00",
      "https://www.luluhypermarket.com/graphql", "https://www.luluhypermarket.com",
      "https://www.luluhypermarket.com", q),
    fetchMagento("Oscar Supermarket", "أوسكار", "#0055A6",
      "https://oscar.com.eg/graphql", "https://oscar.com.eg",
      "https://oscar.com.eg", q),
    fetchMagento("Grand Hyper", "جراند هايبر", "#7C3AED",
      "https://www.grandhyper.com/graphql", "https://www.grandhyper.com",
      "https://www.grandhyper.com", q),
    fetchShopify("Kazyon", "كازيون", "#FF4500", "https://kazyon.com", q),
    fetchShopify("Monoprix Egypt", "مونوبري مصر", "#E91E63", "https://monoprix.com.eg", q),
    fetchShopify("Bonita Egypt", "بونيتا", "#C2185B", "https://bonitaegypt.com", q),
    fetchShopify("El Mahmal", "المحمل", "#00796B", "https://elmahmal.com", q),
    fetchShopify("Green Valley", "جرين فالي", "#388E3C", "https://greenvalleyegypt.com", q),
    fetchShopify("BIM Egypt", "بيم مصر", "#1565C0", "https://bim.com.eg", q),
    fetchShopify("Otlob Mart", "أطلب مارت", "#F44336", "https://otlob.com", q),
    ...localBrandFetches,
  ]);

  const all: MarketPriceResult[] = settled
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<MarketPriceResult[]>).value);

  // Deduplicate by store + price bucket + first 20 chars of name
  const seen = new Set<string>();
  const deduped = all.filter((r) => {
    const key = `${r.store.toLowerCase()}-${Math.round(r.price / 5)}-${r.productName.slice(0, 20).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => a.price - b.price);

  const marketResults = deduped.filter((r) => !r.isLocalBrand);
  const localResults = deduped.filter((r) => r.isLocalBrand);

  return NextResponse.json({
    query: q,
    results: marketResults,
    localBrandResults: localResults,
    count: marketResults.length,
    localCount: localResults.length,
    timestamp: new Date().toISOString(),
  });
}
