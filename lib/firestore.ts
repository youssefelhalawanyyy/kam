import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  barcode?: string;
  description?: string;
  imageUrl?: string;
  createdAt?: Timestamp;
}

export interface Store {
  id: string;
  name: string;
  nameAr?: string;
  location: string;
  address?: string;
  ownerId?: string;
  phone?: string;
  logoUrl?: string;
  createdAt?: Timestamp;
  featured?: boolean;
  featuredUntil?: Timestamp | null;
  featuredLabel?: string | null;
  claimedBy?: string | null;
  verified?: boolean;
}

export interface Price {
  id: string;
  productId: string;
  storeId: string;
  price: number;
  updatedAt: Timestamp;
}

export interface PriceHistory {
  id: string;
  productId: string;
  storeId: string;
  price: number;
  date: Timestamp;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "user" | "store" | "admin";
  storeId?: string;
  createdAt?: Timestamp;
  plan?: "free" | "premium";
  planExpiry?: Timestamp | null;
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  createdAt: Timestamp;
}

export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  targetPrice: number;
  active: boolean;
  createdAt: Timestamp;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function searchProducts(term: string): Promise<Product[]> {
  const all = await getAllProducts();
  const t = term.toLowerCase().trim();
  const tokens = t.split(/\s+/).filter((w) => w.length > 1);

  const scored = all
    .map((p) => {
      const name  = p.name.toLowerCase();
      const nameAr = (p.nameAr || "").toLowerCase();
      const cat   = (p.category || "").toLowerCase();
      const desc  = (p.description || "").toLowerCase();

      let score = 0;
      if (name === t)              score += 100;
      if (name.startsWith(t))      score += 50;
      if (name.includes(t))        score += 30;
      if (nameAr.includes(t))      score += 25;
      for (const tok of tokens) {
        if (name.includes(tok))    score += 12;
        if (nameAr.includes(tok))  score += 10;
        if (cat.includes(tok))     score += 5;
        if (desc.includes(tok))    score += 3;
      }
      return { p, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ p }) => p);

  return scored;
}

export async function addProduct(data: Omit<Product, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "products"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<void> {
  await updateDoc(doc(db, "products", id), data);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}

// ─── Stores ───────────────────────────────────────────────────────────────────

export async function getAllStores(): Promise<Store[]> {
  const snap = await getDocs(collection(db, "stores"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Store));
}

export async function getStoreById(id: string): Promise<Store | null> {
  const snap = await getDoc(doc(db, "stores", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Store;
}

export async function getStoreByOwnerId(ownerId: string): Promise<Store | null> {
  const q = query(collection(db, "stores"), where("ownerId", "==", ownerId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Store;
}

export async function addStore(data: Omit<Store, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "stores"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateStore(
  id: string,
  data: Partial<Store>
): Promise<void> {
  await updateDoc(doc(db, "stores", id), data);
}

// ─── Prices ───────────────────────────────────────────────────────────────────

export async function getPricesForProduct(productId: string): Promise<Price[]> {
  const q = query(collection(db, "prices"), where("productId", "==", productId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Price));
}

export async function getPricesForStore(storeId: string): Promise<Price[]> {
  const q = query(collection(db, "prices"), where("storeId", "==", storeId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Price));
}

export async function setPrice(
  productId: string,
  storeId: string,
  price: number
): Promise<void> {
  // Check if price record exists
  const q = query(
    collection(db, "prices"),
    where("productId", "==", productId),
    where("storeId", "==", storeId)
  );
  const snap = await getDocs(q);

  const now = serverTimestamp();

  if (!snap.empty) {
    const priceDoc = snap.docs[0];
    await updateDoc(doc(db, "prices", priceDoc.id), { price, updatedAt: now });
  } else {
    await addDoc(collection(db, "prices"), {
      productId,
      storeId,
      price,
      updatedAt: now,
    });
  }

  // Save to price history
  await addDoc(collection(db, "priceHistory"), {
    productId,
    storeId,
    price,
    date: now,
  });
}

export async function getPriceHistory(
  productId: string,
  storeId?: string
): Promise<PriceHistory[]> {
  let q;
  if (storeId) {
    q = query(
      collection(db, "priceHistory"),
      where("productId", "==", productId),
      where("storeId", "==", storeId),
      orderBy("date", "asc"),
      limit(30)
    );
  } else {
    q = query(
      collection(db, "priceHistory"),
      where("productId", "==", productId),
      orderBy("date", "asc"),
      limit(60)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PriceHistory));
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, "id">
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), data);
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile));
}

// ─── Subscribers (Marketing) ──────────────────────────────────────────────────

export async function addSubscriber(email: string, name?: string): Promise<void> {
  const q = query(collection(db, "subscribers"), where("email", "==", email));
  const snap = await getDocs(q);
  if (!snap.empty) return; // already subscribed
  await addDoc(collection(db, "subscribers"), {
    email,
    name: name || "",
    createdAt: serverTimestamp(),
  });
}

export async function getAllSubscribers(): Promise<Subscriber[]> {
  const snap = await getDocs(collection(db, "subscribers"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subscriber));
}

// ─── Price Alerts ─────────────────────────────────────────────────────────────

export async function createPriceAlert(
  userId: string,
  productId: string,
  targetPrice: number
): Promise<string> {
  const ref = await addDoc(collection(db, "priceAlerts"), {
    userId,
    productId,
    targetPrice,
    active: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserAlerts(userId: string): Promise<PriceAlert[]> {
  const q = query(
    collection(db, "priceAlerts"),
    where("userId", "==", userId),
    where("active", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PriceAlert));
}

export async function deactivateAlert(alertId: string): Promise<void> {
  await updateDoc(doc(db, "priceAlerts", alertId), { active: false });
}

// ─── Real-time subscriptions ──────────────────────────────────────────────────

export function subscribeToProductPrices(
  productId: string,
  callback: (prices: Price[]) => void
) {
  const q = query(collection(db, "prices"), where("productId", "==", productId));
  return onSnapshot(q, (snap) => {
    const prices = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Price));
    callback(prices);
  });
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: Timestamp;
}

export async function addToWishlist(userId: string, productId: string): Promise<void> {
  const q = query(
    collection(db, "wishlists"),
    where("userId", "==", userId),
    where("productId", "==", productId)
  );
  const snap = await getDocs(q);
  if (!snap.empty) return;
  await addDoc(collection(db, "wishlists"), {
    userId,
    productId,
    addedAt: serverTimestamp(),
  });
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  const q = query(
    collection(db, "wishlists"),
    where("userId", "==", userId),
    where("productId", "==", productId)
  );
  const snap = await getDocs(q);
  for (const d of snap.docs) await deleteDoc(doc(db, "wishlists", d.id));
}

export async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  const q = query(collection(db, "wishlists"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WishlistItem));
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const q = query(
    collection(db, "wishlists"),
    where("userId", "==", userId),
    where("productId", "==", productId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// ─── Shopping Basket ──────────────────────────────────────────────────────────

export interface BasketItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  quantity: number;
  addedAt: Timestamp;
}

export async function addToBasket(
  userId: string,
  productId: string,
  productName: string,
  quantity = 1
): Promise<void> {
  const q = query(
    collection(db, "baskets"),
    where("userId", "==", userId),
    where("productId", "==", productId)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    const existing = snap.docs[0];
    const cur = (existing.data().quantity as number) || 1;
    await updateDoc(doc(db, "baskets", existing.id), { quantity: cur + quantity });
  } else {
    await addDoc(collection(db, "baskets"), {
      userId,
      productId,
      productName,
      quantity,
      addedAt: serverTimestamp(),
    });
  }
}

export async function updateBasketItem(itemId: string, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await deleteDoc(doc(db, "baskets", itemId));
  } else {
    await updateDoc(doc(db, "baskets", itemId), { quantity });
  }
}

export async function removeFromBasket(itemId: string): Promise<void> {
  await deleteDoc(doc(db, "baskets", itemId));
}

export async function getUserBasket(userId: string): Promise<BasketItem[]> {
  const q = query(collection(db, "baskets"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BasketItem));
}

export async function clearBasket(userId: string): Promise<void> {
  const q = query(collection(db, "baskets"), where("userId", "==", userId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  storeId?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Timestamp;
}

export async function addReview(
  userId: string,
  userName: string,
  productId: string,
  rating: number,
  comment: string,
  storeId?: string
): Promise<string> {
  // One review per user per product
  const q = query(
    collection(db, "reviews"),
    where("userId", "==", userId),
    where("productId", "==", productId)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    await updateDoc(doc(db, "reviews", snap.docs[0].id), {
      rating, comment, storeId: storeId || null,
    });
    return snap.docs[0].id;
  }
  const ref = await addDoc(collection(db, "reviews"), {
    userId, userName, productId, storeId: storeId || null,
    rating, comment, createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
}

// ─── Store Claims ─────────────────────────────────────────────────────────────

export interface StoreClaim {
  id: string;
  storeId: string;
  userId: string;
  businessName: string;
  phone: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
}

export interface AffiliateClick {
  id: string;
  store: string;
  productName: string;
  originalUrl: string;
  userId: string | null;
  timestamp: Timestamp;
}

// ─── Deals / Price Drops ──────────────────────────────────────────────────────

export async function getRecentPriceDrops(): Promise<
  { product: Product; oldPrice: number; newPrice: number; drop: number; storeId: string }[]
> {
  // Get recent price history (last 2 days) for all products
  const cutoff = Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
  const histQ = query(
    collection(db, "priceHistory"),
    where("date", ">=", cutoff),
    orderBy("date", "desc"),
    limit(200)
  );
  const histSnap = await getDocs(histQ);
  const history = histSnap.docs.map((d) => ({ id: d.id, ...d.data() } as PriceHistory));

  // Get all products and current prices
  const [products, allPrices] = await Promise.all([getAllProducts(), getDocs(collection(db, "prices"))]);
  const priceMap = new Map<string, number>();
  allPrices.docs.forEach((d) => {
    const data = d.data();
    const key = `${data.productId}:${data.storeId}`;
    priceMap.set(key, data.price as number);
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const drops: { product: Product; oldPrice: number; newPrice: number; drop: number; storeId: string }[] = [];
  const seen = new Set<string>();

  for (const h of history) {
    const key = `${h.productId}:${h.storeId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const current = priceMap.get(key);
    if (!current) continue;
    if (h.price > current * 1.05) {
      const product = productMap.get(h.productId);
      if (!product) continue;
      drops.push({ product, oldPrice: h.price, newPrice: current, drop: h.price - current, storeId: h.storeId });
    }
  }
  return drops.sort((a, b) => b.drop - a.drop).slice(0, 20);
}

// ─── Store Claims ─────────────────────────────────────────────────────────────

export async function createStoreClaim(
  data: Omit<StoreClaim, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "storeClaims"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getStoreClaims(status?: StoreClaim["status"]): Promise<StoreClaim[]> {
  const q = status
    ? query(collection(db, "storeClaims"), where("status", "==", status), orderBy("createdAt", "desc"))
    : query(collection(db, "storeClaims"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as StoreClaim));
}

export async function approveStoreClaim(
  claimId: string,
  storeId: string,
  userId: string,
  reviewerId: string
): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, "storeClaims", claimId), {
    status: "approved",
    reviewedAt: serverTimestamp(),
  });
  batch.update(doc(db, "stores", storeId), {
    claimedBy: userId,
    verified: true,
    ownerId: userId,
  });
  batch.update(doc(db, "users", userId), {
    role: "store",
    storeId,
  });
  await batch.commit();
}

export async function rejectStoreClaim(
  claimId: string,
  reason: string
): Promise<void> {
  await updateDoc(doc(db, "storeClaims", claimId), {
    status: "rejected",
    rejectionReason: reason,
    reviewedAt: serverTimestamp(),
  });
}

// ─── Featured Stores ──────────────────────────────────────────────────────────

export async function setStoreFeatured(
  storeId: string,
  featured: boolean,
  until?: Date | null,
  label?: string
): Promise<void> {
  await updateDoc(doc(db, "stores", storeId), {
    featured,
    featuredUntil: until ? Timestamp.fromDate(until) : null,
    featuredLabel: label || null,
  });
}

// ─── Affiliate Clicks ─────────────────────────────────────────────────────────

export async function logAffiliateClick(
  data: Omit<AffiliateClick, "id" | "timestamp">
): Promise<void> {
  await addDoc(collection(db, "affiliateClicks"), {
    ...data,
    timestamp: serverTimestamp(),
  });
}

export async function getAffiliateClicks(options?: {
  store?: string;
  limit?: number;
}): Promise<AffiliateClick[]> {
  const q = options?.store
    ? query(
        collection(db, "affiliateClicks"),
        where("store", "==", options.store),
        orderBy("timestamp", "desc"),
        limit(options.limit ?? 500)
      )
    : query(
        collection(db, "affiliateClicks"),
        orderBy("timestamp", "desc"),
        limit(options?.limit ?? 500)
      );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AffiliateClick));
}
