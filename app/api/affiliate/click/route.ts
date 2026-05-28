import { NextRequest, NextResponse } from "next/server";
import { logAffiliateClick } from "@/lib/firestore";

const ALLOWED_HOSTS = ["www.jumia.com.eg", "jumia.com.eg", "www.amazon.eg", "amazon.eg", "www.hyperone.com.eg", "gourmetegypt.com"];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const store = req.nextUrl.searchParams.get("store") || "";
  const productName = req.nextUrl.searchParams.get("product") || "";
  const userId = req.nextUrl.searchParams.get("uid") || null;

  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return NextResponse.redirect(url);
  }

  // Add affiliate tags
  if (parsed.hostname.includes("jumia")) {
    parsed.searchParams.set("aff_src", "bkam");
    parsed.searchParams.set("utm_source", "bkam");
    parsed.searchParams.set("utm_medium", "affiliate");
  } else if (parsed.hostname.includes("amazon")) {
    parsed.searchParams.set("tag", "bkam-21");
    parsed.searchParams.set("utm_source", "bkam");
  }

  // Log click (fire-and-forget)
  logAffiliateClick({ store, productName, originalUrl: url, userId }).catch(() => {});

  return NextResponse.redirect(parsed.toString());
}
