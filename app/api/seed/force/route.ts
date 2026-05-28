import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  doc,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const PRODUCTS = [
  { name: "Panadol 500mg (24 tablets)", nameAr: "بانادول 500 مجم (24 قرص)", category: "pharmacy", barcode: "6223004400015", description: "Pain relief and fever reducer" },
  { name: "Full Cream Milk 1L", nameAr: "حليب كامل الدسم 1 لتر", category: "dairy", barcode: "6223001100023", description: "Fresh full cream pasteurized milk" },
  { name: "White Rice 5kg", nameAr: "أرز أبيض 5 كيلو", category: "grains", barcode: "6223003300014", description: "Premium Egyptian white rice" },
  { name: "Eggs (30 pieces)", nameAr: "بيض (30 بيضة)", category: "dairy", barcode: "6223005500012", description: "Fresh farm eggs" },
  { name: "Extra Virgin Olive Oil 750ml", nameAr: "زيت زيتون بكر ممتاز 750 مل", category: "oils", barcode: "6223006600011", description: "Premium cold pressed olive oil" },
  { name: "Sunflower Cooking Oil 1.8L", nameAr: "زيت عباد الشمس للطهي 1.8 لتر", category: "oils", barcode: "6223007700010", description: "Pure sunflower oil for cooking" },
  { name: "Sugar 2kg", nameAr: "سكر 2 كيلو", category: "pantry", barcode: "6223008800019", description: "White refined sugar" },
  { name: "Ibuprofen 400mg (20 tablets)", nameAr: "إيبوبروفين 400 مجم (20 قرص)", category: "pharmacy", barcode: "6223009900018", description: "Anti-inflammatory pain relief" },
  { name: "Pasta 500g", nameAr: "مكرونة 500 جرام", category: "grains", barcode: "6223010100017", description: "Egyptian durum wheat pasta" },
  { name: "Tomato Paste 400g", nameAr: "معجون طماطم 400 جرام", category: "canned", barcode: "6223011200016", description: "Concentrated tomato paste" },
  { name: "Bread Flour 2kg", nameAr: "دقيق خبز 2 كيلو", category: "grains", barcode: "6223012300015", description: "Premium wheat flour" },
  { name: "Butter 200g", nameAr: "زبدة 200 جرام", category: "dairy", barcode: "6223013400014", description: "Pure butter" },
  { name: "Cheese Spreadable 200g", nameAr: "جبنة قابلة للدهن 200 جرام", category: "dairy", barcode: "6223014500013", description: "Creamy spreadable cheese" },
  { name: "Canned Tuna 185g", nameAr: "تونة معلبة 185 جرام", category: "canned", barcode: "6223015600012", description: "Tuna in sunflower oil" },
  { name: "Chickpeas 500g", nameAr: "حمص 500 جرام", category: "canned", barcode: "6223016700011", description: "Cooked chickpeas" },
  { name: "Lentils 1kg", nameAr: "عدس 1 كيلو", category: "pantry", barcode: "6223017800010", description: "Red lentils" },
  { name: "Ketchup 500g", nameAr: "كاتشب 500 جرام", category: "pantry", barcode: "6223018900019", description: "Tomato ketchup" },
  { name: "Salt 1kg", nameAr: "ملح 1 كيلو", category: "pantry", barcode: "6223019000018", description: "Iodized table salt" },
  { name: "Black Tea 100 bags", nameAr: "شاي أسود 100 كيس", category: "pantry", barcode: "6223020100017", description: "Egyptian black tea bags" },
  { name: "Nescafe Classic 200g", nameAr: "نسكافيه كلاسيك 200 جرام", category: "pantry", barcode: "6223021200016", description: "Instant coffee" },
];

const STORES = [
  { name: "Carrefour", nameAr: "كارفور", location: "Nasr City", address: "City Stars Mall, Omar Ibn El Khatab St, Nasr City", phone: "+20 2 2480 0000" },
  { name: "Metro Market", nameAr: "مترو ماركت", location: "Maadi", address: "Road 9, Maadi, Cairo", phone: "+20 2 2358 0000" },
  { name: "Seoudi Market", nameAr: "سعودي ماركت", location: "Dokki", address: "El Batal Ahmed Abd El Aziz St, Dokki, Giza", phone: "+20 2 3760 0000" },
  { name: "Hyper One", nameAr: "هايبر ون", location: "6th of October", address: "Mall of Arabia, 6th of October City", phone: "+20 2 3827 0000" },
  { name: "Spinneys", nameAr: "سبينيس", location: "Zamalek", address: "26 July St, Zamalek, Cairo", phone: "+20 2 2735 0000" },
  { name: "Kheir Zaman", nameAr: "خير زمان", location: "Heliopolis", address: "Thawra St, Heliopolis, Cairo", phone: "+20 2 2415 0000" },
  { name: "Kazyon", nameAr: "كازيون", location: "Various", address: "Multiple branches across Cairo", phone: "+20 2 2500 0000" },
];

const PRICE_RANGES: Record<string, [number, number]> = {
  "Panadol 500mg (24 tablets)": [45, 72],
  "Full Cream Milk 1L": [28, 48],
  "White Rice 5kg": [95, 145],
  "Eggs (30 pieces)": [110, 168],
  "Extra Virgin Olive Oil 750ml": [180, 260],
  "Sunflower Cooking Oil 1.8L": [85, 118],
  "Sugar 2kg": [48, 68],
  "Ibuprofen 400mg (20 tablets)": [35, 58],
  "Pasta 500g": [22, 42],
  "Tomato Paste 400g": [18, 32],
  "Bread Flour 2kg": [38, 58],
  "Butter 200g": [75, 115],
  "Cheese Spreadable 200g": [55, 85],
  "Canned Tuna 185g": [42, 68],
  "Chickpeas 500g": [25, 42],
  "Lentils 1kg": [28, 45],
  "Ketchup 500g": [35, 55],
  "Salt 1kg": [8, 18],
  "Black Tea 100 bags": [65, 95],
  "Nescafe Classic 200g": [145, 210],
};

function randomPrice(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST() {
  try {
    const productBatch = writeBatch(db);
    const storeBatch = writeBatch(db);

    const productIds: string[] = [];
    const storeIds: string[] = [];

    // Add products
    for (const product of PRODUCTS) {
      const ref = doc(collection(db, "products"));
      productBatch.set(ref, { ...product, createdAt: serverTimestamp() });
      productIds.push(ref.id);
    }

    // Add stores
    for (const store of STORES) {
      const ref = doc(collection(db, "stores"));
      storeBatch.set(ref, { ...store, createdAt: serverTimestamp() });
      storeIds.push(ref.id);
    }

    await productBatch.commit();
    await storeBatch.commit();

    // Add prices
    const priceBatch = writeBatch(db);
    const historyBatch = writeBatch(db);

    for (let pi = 0; pi < productIds.length; pi++) {
      const productId = productIds[pi];
      const productName = PRODUCTS[pi].name;
      const range = PRICE_RANGES[productName] || [20, 100];

      for (let si = 0; si < storeIds.length; si++) {
        const storeId = storeIds[si];
        const price = randomPrice(range[0], range[1]);

        const priceRef = doc(collection(db, "prices"));
        priceBatch.set(priceRef, {
          productId,
          storeId,
          price,
          updatedAt: serverTimestamp(),
        });

        // 7 history points
        for (let h = 6; h >= 0; h--) {
          const histRef = doc(collection(db, "priceHistory"));
          const daysAgo = new Date();
          daysAgo.setDate(daysAgo.getDate() - h * 5);
          historyBatch.set(histRef, {
            productId,
            storeId,
            price: randomPrice(range[0], range[1]),
            date: Timestamp.fromDate(daysAgo),
          });
        }
      }
    }

    await priceBatch.commit();
    await historyBatch.commit();

    return NextResponse.json({
      success: true,
      message: `Seeded ${PRODUCTS.length} products, ${STORES.length} stores with prices`,
      products: PRODUCTS.length,
      stores: STORES.length,
    });
  } catch (err: unknown) {
    console.error("Seed error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
