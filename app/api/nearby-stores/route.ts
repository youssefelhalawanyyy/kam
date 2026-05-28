import { NextRequest, NextResponse } from "next/server";

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat    = searchParams.get("lat");
  const lng    = searchParams.get("lng");
  const radius = searchParams.get("radius") || "3000";

  if (!lat || !lng)
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });

  // Overpass QL query — finds all shops & amenities nearby
  const query = `
[out:json][timeout:25];
(
  node["shop"~"supermarket|grocery|convenience|bakery|butcher|greengrocer|deli|mall|department_store|market|general|food|pastry|confectionery"](around:${radius},${lat},${lng});
  node["amenity"~"pharmacy|marketplace|market"](around:${radius},${lat},${lng});
  way["shop"~"supermarket|grocery|convenience|bakery|mall|department_store|market|general|food"](around:${radius},${lat},${lng});
  way["amenity"~"pharmacy|marketplace|market"](around:${radius},${lat},${lng});
);
out center body;
  `.trim();

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    `data=${encodeURIComponent(query)}`,
      next:    { revalidate: 0 },
    });

    if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);
    const data = await res.json();

    const seen  = new Set<string>();
    const stores = (data.elements as any[])
      .map((el) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLng = el.lon ?? el.center?.lon;
        if (!elLat || !elLng) return null;

        const tags = el.tags || {};
        const name = tags.name || tags["name:en"] || tags["name:ar"] || null;
        if (!name) return null;

        // Deduplicate by name+approximate position
        const key = `${name.toLowerCase()}_${Math.round(elLat * 1000)}_${Math.round(elLng * 1000)}`;
        if (seen.has(key)) return null;
        seen.add(key);

        const phone   = tags.phone || tags["contact:phone"] || tags["contact:mobile"] || null;
        const website = tags.website || tags["contact:website"] || null;
        const hours   = tags.opening_hours || null;
        const address = [
          tags["addr:housenumber"],
          tags["addr:street"],
          tags["addr:suburb"],
          tags["addr:city"],
        ].filter(Boolean).join(", ") || tags["addr:full"] || null;

        const shopType  = tags.shop    || null;
        const amenity   = tags.amenity || null;
        const type      = shopType || amenity || "store";
        const dist      = haversine(+lat, +lng, elLat, elLng);

        return {
          id:           `${el.type}_${el.id}`,
          name,
          address,
          phone,
          website,
          opening_hours: hours,
          type,
          name_ar:      tags["name:ar"] || null,
          lat:          elLat as number,
          lng:          elLng as number,
          distance_km:  Math.round(dist * 10) / 10,
          osm_id:       el.id as number,
          osm_type:     el.type as string,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.distance_km - b.distance_km)
      .slice(0, 40);

    return NextResponse.json({ stores });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch nearby stores" }, { status: 500 });
  }
}
