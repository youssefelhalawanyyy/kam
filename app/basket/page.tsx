"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBasket, Plus, Minus, Trash2, Search, Trophy, TrendingDown,
  Store as StoreIcon, Loader2, X, Package,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserBasket, updateBasketItem, removeFromBasket, clearBasket, addToBasket,
  getAllProducts, getPricesForProduct, getAllStores, BasketItem, Product, Price, Store,
} from "@/lib/firestore";
import toast from "react-hot-toast";

interface EnrichedItem extends BasketItem {
  product?: Product;
  prices: Price[];
}

interface StoreTotal { storeId: string; storeName: string; total: number; hasAll: boolean; missingCount: number }

export default function BasketPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [basket, storeList, allProds] = await Promise.all([
      getUserBasket(user.uid),
      getAllStores(),
      getAllProducts(),
    ]);
    setStores(storeList);
    const productMap = new Map(allProds.map((p) => [p.id, p]));
    const enriched = await Promise.all(
      basket.map(async (item) => ({
        ...item,
        product: productMap.get(item.productId),
        prices: await getPricesForProduct(item.productId),
      }))
    );
    setItems(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Search products to add
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { searchProducts } = await import("@/lib/firestore");
      const results = await searchProducts(searchQuery);
      setSearchResults(results.slice(0, 6));
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function addProduct(product: Product) {
    if (!user) { toast.error("Sign in to use basket"); return; }
    await addToBasket(user.uid, product.id, product.name);
    setSearchQuery("");
    setSearchResults([]);
    await load();
    toast.success(`Added ${product.name}`);
  }

  async function updateQty(item: EnrichedItem, delta: number) {
    const newQty = item.quantity + delta;
    await updateBasketItem(item.id, newQty);
    if (newQty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity: newQty } : i));
    }
  }

  async function remove(item: EnrichedItem) {
    await removeFromBasket(item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  async function handleClear() {
    if (!user) return;
    await clearBasket(user.uid);
    setItems([]);
    toast.success("Basket cleared");
  }

  // Calculate store totals
  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const storeTotals: StoreTotal[] = stores.map((store) => {
    let total = 0;
    let hasAll = true;
    let missingCount = 0;
    for (const item of items) {
      const price = item.prices.find((p) => p.storeId === store.id);
      if (price) {
        total += price.price * item.quantity;
      } else {
        hasAll = false;
        missingCount++;
      }
    }
    return { storeId: store.id, storeName: store.name, total, hasAll, missingCount };
  }).filter((s) => s.total > 0).sort((a, b) => a.total - b.total);

  const cheapestStore = storeTotals.find((s) => s.hasAll) || storeTotals[0];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 pt-16 px-4">
        <ShoppingBasket className="w-16 h-16 text-slate-300" />
        <h1 className="text-2xl font-bold text-slate-800">Smart Basket</h1>
        <p className="text-slate-500 text-center max-w-sm">Sign in to build your shopping basket and find the cheapest store for your full list.</p>
        <Link href="/auth/login" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition-all">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBasket className="w-6 h-6 text-emerald-500" />
              Smart Basket
            </h1>
            <p className="text-sm text-slate-500 mt-1">Build your list — we&apos;ll find the cheapest store</p>
          </div>
          {items.length > 0 && (
            <button onClick={handleClear} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: basket items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Add product search */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 relative">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search and add a product..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
                {searching && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </div>
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="absolute left-4 right-4 top-full mt-1 bg-white rounded-2xl border border-slate-100 shadow-xl z-10 overflow-hidden">
                    {searchResults.map((product) => (
                      <button key={product.id} onClick={() => addProduct(product)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-all text-left border-b border-slate-50 last:border-0">
                        <Plus className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.category}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Basket items */}
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Your basket is empty</p>
                <p className="text-slate-400 text-sm mt-1">Search for products above to add them</p>
              </div>
            ) : (
              <AnimatePresence>
                {items.map((item) => {
                  const bestPrice = item.prices.length ? Math.min(...item.prices.map((p) => p.price)) : null;
                  return (
                    <motion.div key={item.id} layout
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{item.product?.name || item.productName}</p>
                        <p className="text-xs text-slate-400">{item.product?.category}</p>
                        {bestPrice !== null && (
                          <p className="text-sm text-emerald-600 font-medium mt-0.5">from {bestPrice} EGP</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all">
                          <Minus className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                        <button onClick={() => updateQty(item, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all">
                          <Plus className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button onClick={() => remove(item)}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-all ml-1">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Right: store comparison */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <StoreIcon className="w-5 h-5 text-emerald-500" />
                Store Comparison
              </h2>

              {items.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">Add products to see store totals</p>
              ) : storeTotals.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No price data yet for these products</p>
              ) : (
                <div className="space-y-3">
                  {storeTotals.map((st, i) => (
                    <div key={st.storeId}
                      className={`p-3 rounded-xl border transition-all ${
                        i === 0 ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {i === 0 && <Trophy className="w-4 h-4 text-emerald-500" />}
                          <span className={`text-sm font-semibold ${i === 0 ? "text-emerald-700" : "text-slate-700"}`}>
                            {st.storeName}
                          </span>
                        </div>
                        <span className={`font-bold ${i === 0 ? "text-emerald-600" : "text-slate-600"}`}>
                          {st.total.toFixed(0)} EGP
                        </span>
                      </div>
                      {st.missingCount > 0 && (
                        <p className="text-xs text-slate-400 mt-1">{st.missingCount} item(s) not available</p>
                      )}
                    </div>
                  ))}

                  {cheapestStore && storeTotals.length > 1 && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm font-bold">Best choice: {cheapestStore.storeName}</span>
                      </div>
                      <p className="text-xs opacity-80">
                        Save {(storeTotals[storeTotals.length - 1].total - cheapestStore.total).toFixed(0)} EGP vs most expensive store
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Link href="/search"
                className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-dashed border-emerald-300 hover:bg-emerald-50 text-emerald-600 text-sm font-medium rounded-xl transition-all">
                <Plus className="w-4 h-4" />
                Add more products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
