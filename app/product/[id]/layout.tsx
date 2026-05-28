import { Metadata } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const snap = await getDoc(doc(db, "products", id));
    if (!snap.exists()) {
      return { title: "Product | BKAM", description: "Compare prices in Egypt" };
    }
    const p = snap.data();
    const name = p.name || "Product";
    const nameAr = p.nameAr || "";
    const category = p.category || "";
    return {
      title: `${name} prices in Egypt | BKAM بكام`,
      description: `Compare ${name} ${nameAr} prices across Carrefour, Metro, Kheir Zaman, Jumia and more Egyptian stores. Find the cheapest price today.`,
      keywords: [`${name}`, `${nameAr}`, "price comparison Egypt", "أسعار مصر", category, "بكام", "BKAM"],
      openGraph: {
        title: `${name} – Best Price in Egypt | BKAM`,
        description: `Find the cheapest ${name} across all Egyptian supermarkets and pharmacies.`,
        type: "website",
        locale: "ar_EG",
        siteName: "BKAM بكام",
      },
      twitter: {
        card: "summary",
        title: `${name} prices | BKAM`,
        description: `Compare ${name} prices in Egypt`,
      },
    };
  } catch {
    return { title: "Product | BKAM" };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
