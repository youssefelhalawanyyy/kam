import {
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const PRODUCTS = [
  {
    name: "Panadol 500mg (24 tablets)",
    nameAr: "بانادول 500 مجم (24 قرص)",
    category: "pharmacy",
    barcode: "6223004400015",
    description: "Pain relief and fever reducer",
    imageUrl: "/images/panadol.png",
  },
  {
    name: "Full Cream Milk 1L",
    nameAr: "حليب كامل الدسم 1 لتر",
    category: "dairy",
    barcode: "6223001100023",
    description: "Fresh full cream pasteurized milk",
    imageUrl: "/images/milk.png",
  },
  {
    name: "White Rice 5kg",
    nameAr: "أرز أبيض 5 كيلو",
    category: "grains",
    barcode: "6223003300014",
    description: "Premium Egyptian white rice",
    imageUrl: "/images/rice.png",
  },
  {
    name: "Eggs (30 pieces)",
    nameAr: "بيض (30 بيضة)",
    category: "dairy",
    barcode: "6223005500012",
    description: "Fresh farm eggs",
    imageUrl: "/images/eggs.png",
  },
  {
    name: "Extra Virgin Olive Oil 750ml",
    nameAr: "زيت زيتون بكر ممتاز 750 مل",
    category: "oils",
    barcode: "6223006600011",
    description: "Premium cold pressed olive oil",
    imageUrl: "/images/oliveoil.png",
  },
  {
    name: "Sunflower Cooking Oil 1.8L",
    nameAr: "زيت عباد الشمس للطهي 1.8 لتر",
    category: "oils",
    barcode: "6223007700010",
    description: "Pure sunflower oil for cooking",
    imageUrl: "/images/sunfloweroil.png",
  },
  {
    name: "Sugar 2kg",
    nameAr: "سكر 2 كيلو",
    category: "pantry",
    barcode: "6223008800019",
    description: "White refined sugar",
    imageUrl: "/images/sugar.png",
  },
  {
    name: "Ibuprofen 400mg (20 tablets)",
    nameAr: "إيبوبروفين 400 مجم (20 قرص)",
    category: "pharmacy",
    barcode: "6223009900018",
    description: "Anti-inflammatory pain relief",
    imageUrl: "/images/ibuprofen.png",
  },
  {
    name: "Pasta 500g",
    nameAr: "مكرونة 500 جرام",
    category: "grains",
    barcode: "6223010100017",
    description: "Egyptian durum wheat pasta",
    imageUrl: "/images/pasta.png",
  },
  {
    name: "Tomato Paste 400g",
    nameAr: "معجون طماطم 400 جرام",
    category: "canned",
    barcode: "6223011200016",
    description: "Concentrated tomato paste",
    imageUrl: "/images/tomatopaste.png",
  },
];

const STORES = [
  {
    name: "Carrefour",
    nameAr: "كارفور",
    location: "Nasr City",
    address: "City Stars Mall, Omar Ibn El Khatab St, Nasr City",
    phone: "+20 2 2480 0000",
  },
  {
    name: "Metro Market",
    nameAr: "مترو ماركت",
    location: "Maadi",
    address: "Road 9, Maadi, Cairo",
    phone: "+20 2 2358 0000",
  },
  {
    name: "Seoudi Market",
    nameAr: "سيودي ماركت",
    location: "Dokki",
    address: "El Batal Ahmed Abd El Aziz St, Dokki, Giza",
    phone: "+20 2 3760 0000",
  },
  {
    name: "Hyper One",
    nameAr: "هايبر ون",
    location: "6th of October",
    address: "Mall of Arabia, 6th of October City",
    phone: "+20 2 3827 0000",
  },
  {
    name: "Spinneys",
    nameAr: "سبينيس",
    location: "Zamalek",
    address: "26 July St, Zamalek, Cairo",
    phone: "+20 2 2735 0000",
  },
];

// Price ranges per product (realistic EGP prices)
const PRICE_RANGES: Record<string, [number, number]> = {
  "Panadol 500mg (24 tablets)": [45, 70],
  "Full Cream Milk 1L": [28, 45],
  "White Rice 5kg": [95, 140],
  "Eggs (30 pieces)": [110, 160],
  "Extra Virgin Olive Oil 750ml": [180, 250],
  "Sunflower Cooking Oil 1.8L": [85, 115],
  "Sugar 2kg": [48, 65],
  "Ibuprofen 400mg (20 tablets)": [35, 55],
  "Pasta 500g": [22, 38],
  "Tomato Paste 400g": [18, 30],
};

function randomPrice(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedFirestore(): Promise<void> {
  // Check if already seeded
  const existingProducts = await getDocs(collection(db, "products"));
  if (!existingProducts.empty) {
    console.log("Firestore already seeded.");
    return;
  }

  console.log("Seeding Firestore...");

  const batch = writeBatch(db);

  // Add products
  const productIds: string[] = [];
  for (const product of PRODUCTS) {
    const ref = doc(collection(db, "products"));
    batch.set(ref, { ...product, createdAt: serverTimestamp() });
    productIds.push(ref.id);
  }

  // Add stores
  const storeIds: string[] = [];
  for (const store of STORES) {
    const ref = doc(collection(db, "stores"));
    batch.set(ref, { ...store, createdAt: serverTimestamp() });
    storeIds.push(ref.id);
  }

  await batch.commit();

  // Add prices (separate batch due to size limits)
  const priceBatch = writeBatch(db);
  const historyBatch = writeBatch(db);

  for (let pi = 0; pi < productIds.length; pi++) {
    const productId = productIds[pi];
    const productName = PRODUCTS[pi].name;
    const range = PRICE_RANGES[productName] || [20, 100];

    for (let si = 0; si < storeIds.length; si++) {
      const storeId = storeIds[si];
      const price = randomPrice(range[0], range[1]);

      // Current price
      const priceRef = doc(collection(db, "prices"));
      priceBatch.set(priceRef, {
        productId,
        storeId,
        price,
        updatedAt: serverTimestamp(),
      });

      // Price history (last 7 data points)
      for (let h = 6; h >= 0; h--) {
        const histRef = doc(collection(db, "priceHistory"));
        const histPrice = randomPrice(range[0], range[1]);
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - h * 5);
        historyBatch.set(histRef, {
          productId,
          storeId,
          price: histPrice,
          date: Timestamp.fromDate(daysAgo),
        });
      }
    }
  }

  await priceBatch.commit();
  await historyBatch.commit();

  console.log("Firestore seeded successfully!");
}
