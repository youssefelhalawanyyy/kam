"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, X, Plus, Trophy, TrendingDown, Star, Package, ArrowLeft } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { getPricesForProduct, getAllStores, Product, Price, Store } from "@/lib/firestore";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const CATEGORY_ICONS: Record<string, string> = {
  pharmacy: "💊", dairy: "🥛", grains: "🌾", oils: "🫙", pantry: "🍚", canned: "🥫",
};

interface ProductData { product: Product; prices: Price[] }

export default function ComparePage() {
  const router = useRouter();
  const { items, toggle, clear } = useCompare();
  const [data, setData] = useState<ProductData[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    setLoading(true);
    Promise.all([
      getAllStores(),
      ...items.map((p) => getPricesForProduct(p.id).then((prices) => ({ product: p, prices }))),
    ]).then(([storeList, ...productData]) => {
      setStores(storeList as Store[]);
      setData(productData as ProductData[]);
      setLoading(false);
    });
  }, [items]);

  // All unique store IDs across all products
  const allStoreIds = [...new Set(data.flatMap((d) => d.prices.map((p) => p.storeId)))];
  const storeMap = new Map(stores.map((s) => [s.id, s]));

  function getPriceForStore(productData: ProductData, storeId: string): number | null {
    const p = productData.prices.find((p) => p.storeId === storeId);
    return p ? p.price : null;
  }

  function getBestPrice(productData: ProductData): number | null {
    if (!productData.prices.length) return null;
    return Math.min(...productData.prices.map((p) => p.price));
  }

  function getWinner(storeId: string): string | null {
    // Which product has the lowest price in this store?
    let best: string | null = null;
    let bestVal = Infinity;
    for (const d of data) {
      const p = getPriceForStore(d, storeId);
      if (p !== null && p < bestVal) { bestVal = p; best = d.product.id; }
    }
    return best;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 pt-16 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GitCompare className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Compare Products</h1>
          <p className="text-slate-500 max-w-sm">
            Add products to compare by clicking the compare button on any product card or page.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 transition-all">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Compare Products</h1>
              <p className="text-sm text-slate-500">Side-by-side price comparison</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/search" className="flex items-center gap-1.5 px-4 py-2 border border-dashed border-slate-300 hover:border-emerald-400 text-slate-500 hover:text-emerald-600 text-sm rounded-xl transition-all">
              <Plus className="w-4 h-4" />
              Add product
            </Link>
            <button onClick={clear} className="px-4 py-2 text-red-500 hover:bg-red-50 text-sm rounded-xl transition-all">
              Clear all
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading comparison..." /></div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-semibold text-slate-500 pb-4 pr-4 w-40">Store / Product</th>
                  {data.map(({ product }) => (
                    <th key={product.id} className="pb-4 px-2 min-w-[200px]">
                      <div className="bg-white rounded-2xl border border-slate-100 p-4 relative">
                        <button
                          onClick={() => toggle(product)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 flex items-center justify-center transition-all"
                        >
                          <X className="w-3 h-3 text-slate-500 hover:text-red-500" />
                        </button>
                        <div className="text-4xl mb-2">{CATEGORY_ICONS[product.category] || "📦"}</div>
                        <Link href={`/product/${product.id}`} className="text-sm font-bold text-slate-800 hover:text-emerald-600 transition-colors line-clamp-2">
                          {product.name}
                        </Link>
                        <span className="text-xs text-slate-400">{product.category}</span>
                        {getBestPrice({ product, prices: data.find((d) => d.product.id === product.id)?.prices || [] }) !== null && (
                          <div className="mt-2 flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs text-emerald-600 font-semibold">
                              Best: {getBestPrice({ product, prices: data.find((d) => d.product.id === product.id)?.prices || [] })} EGP
                            </span>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allStoreIds.map((storeId) => {
                  const store = storeMap.get(storeId);
                  const winnerId = getWinner(storeId);
                  return (
                    <tr key={storeId} className="group">
                      <td className="py-3 pr-4">
                        <div className="text-sm font-medium text-slate-700">{store?.name || storeId}</div>
                        <div className="text-xs text-slate-400">{store?.location}</div>
                      </td>
                      {data.map(({ product }) => {
                        const price = getPriceForStore(data.find((d) => d.product.id === product.id)!, storeId);
                        const isWinner = winnerId === product.id;
                        return (
                          <td key={product.id} className="py-3 px-2 text-center">
                            {price !== null ? (
                              <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold ${
                                isWinner ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-600"
                              }`}>
                                {isWinner && <Trophy className="w-3.5 h-3.5 text-emerald-500" />}
                                {price} EGP
                              </div>
                            ) : (
                              <span className="text-slate-300 text-sm">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Summary row */}
                <tr className="bg-slate-50">
                  <td className="py-4 pr-4 text-sm font-bold text-slate-700">Best Price</td>
                  {data.map(({ product, prices }) => {
                    const best = prices.length ? Math.min(...prices.map((p) => p.price)) : null;
                    const worst = prices.length ? Math.max(...prices.map((p) => p.price)) : null;
                    const savings = best !== null && worst !== null ? worst - best : 0;
                    return (
                      <td key={product.id} className="py-4 px-2 text-center">
                        {best !== null ? (
                          <div>
                            <div className="text-lg font-extrabold text-emerald-600">{best} EGP</div>
                            {savings > 0 && (
                              <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mt-1">
                                <TrendingDown className="w-3 h-3 text-emerald-500" />
                                Save up to {savings.toFixed(0)} EGP
                              </div>
                            )}
                          </div>
                        ) : <span className="text-slate-400">N/A</span>}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>

            {/* Category breakdown */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.map(({ product, prices }) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="text-2xl">{CATEGORY_ICONS[product.category] || "📦"}</span>
                    {product.name}
                  </h3>
                  <div className="space-y-1.5">
                    {prices.sort((a, b) => a.price - b.price).map((price) => {
                      const store = storeMap.get(price.storeId);
                      return (
                        <div key={price.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{store?.name || "Store"}</span>
                          <span className="font-semibold text-slate-800">{price.price} EGP</span>
                        </div>
                      );
                    })}
                    {prices.length === 0 && (
                      <p className="text-slate-400 text-sm flex items-center gap-1.5">
                        <Package className="w-4 h-4" /> No prices yet
                      </p>
                    )}
                  </div>
                  <Link href={`/product/${product.id}`}
                    className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    <Star className="w-3 h-3" /> View full details
                  </Link>
                </motion.div>
              ))}
              {items.length < 3 && (
                <AnimatePresence>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center gap-3 min-h-[160px]">
                    <Plus className="w-8 h-8 text-slate-300" />
                    <p className="text-slate-400 text-sm text-center">Add another product to compare</p>
                    <Link href="/search" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Browse →</Link>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
