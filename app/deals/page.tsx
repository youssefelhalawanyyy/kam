"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingDown, Flame, Tag, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { getRecentPriceDrops, getAllStores, getAllProducts, getPricesForProduct, Store, Product, Price } from "@/lib/firestore";

interface Deal {
  product: Product;
  oldPrice: number;
  newPrice: number;
  drop: number;
  storeId: string;
}

interface TopValue { product: Product; prices: Price[]; stores: Store[] }

const CATEGORY_ICONS: Record<string, string> = {
  pharmacy: "💊", dairy: "🥛", grains: "🌾", oils: "🫙", pantry: "🍚", canned: "🥫",
};
const CATEGORIES = ["all", "pharmacy", "dairy", "grains", "oils", "pantry", "canned"];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [topValue, setTopValue] = useState<TopValue[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [drops, storeList, products] = await Promise.all([
        getRecentPriceDrops(),
        getAllStores(),
        getAllProducts(),
      ]);
      setDeals(drops);
      setStores(storeList);
      // Top value: products with most stores tracking them
      const priceData = await Promise.all(
        products.slice(0, 20).map((p) => getPricesForProduct(p.id).then((prices) => ({ product: p, prices, stores: storeList })))
      );
      setTopValue(priceData.filter((d) => d.prices.length >= 2).slice(0, 9));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const filtered = activeCategory === "all" ? deals : deals.filter((d) => d.product.category === activeCategory);

  const pctDrop = (deal: Deal) => Math.round((deal.drop / deal.oldPrice) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-6 h-6 text-orange-500" />
                <h1 className="text-3xl font-extrabold text-slate-800">Today&apos;s Deals</h1>
              </div>
              <p className="text-slate-500">Biggest price drops across Egyptian markets</p>
            </div>
            <button
              onClick={() => { setRefreshing(true); load(); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-emerald-400 text-slate-600 hover:text-emerald-600 text-sm rounded-xl transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: "Price Drops Today", value: deals.length, icon: TrendingDown, color: "emerald" },
              { label: "Avg. Saving", value: deals.length ? `${Math.round(deals.reduce((s, d) => s + d.drop, 0) / deals.length)} EGP` : "—", icon: Tag, color: "blue" },
              { label: "Biggest Drop", value: deals[0] ? `${pctDrop(deals[0])}%` : "—", icon: Flame, color: "orange" },
            ].map((s) => (
              <div key={s.label} className={`bg-white rounded-2xl border border-slate-100 p-4`}>
                <s.icon className={`w-5 h-5 text-${s.color}-500 mb-2`} />
                <p className="text-2xl font-extrabold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-emerald-500 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300"
              }`}
            >
              {CATEGORY_ICONS[cat] || ""} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            {/* Price drops */}
            {filtered.length > 0 ? (
              <section className="mb-10">
                <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-500" />
                  Recent Price Drops
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((deal, i) => (
                    <motion.div key={`${deal.product.id}-${deal.storeId}`}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/product/${deal.product.id}`}
                        className="block bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md p-5 transition-all group">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl">{CATEGORY_ICONS[deal.product.category] || "📦"}</span>
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg">
                            -{pctDrop(deal)}%
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 group-hover:text-emerald-700 mb-1">
                          {deal.product.name}
                        </h3>
                        <p className="text-xs text-slate-400 mb-3">{storeMap.get(deal.storeId)?.name || deal.storeId}</p>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-extrabold text-emerald-600">{deal.newPrice} EGP</span>
                          <span className="text-sm text-slate-400 line-through mb-0.5">{deal.oldPrice} EGP</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 font-medium">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Save {deal.drop.toFixed(0)} EGP
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 mb-10">
                <TrendingDown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No price drops in this category yet</p>
                <p className="text-slate-400 text-sm mt-1">Check back soon as prices update daily</p>
              </div>
            )}

            {/* Best value products */}
            <section>
              <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-500" />
                Best Value Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topValue.map(({ product, prices }, i) => {
                  const best = prices.length ? Math.min(...prices.map((p) => p.price)) : null;
                  const worst = prices.length ? Math.max(...prices.map((p) => p.price)) : null;
                  return (
                    <motion.div key={product.id}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/product/${product.id}`}
                        className="block bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md p-5 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl">{CATEGORY_ICONS[product.category] || "📦"}</span>
                          <span className="text-xs text-slate-400">{prices.length} stores</span>
                        </div>
                        <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-700 mb-3">
                          {product.name}
                        </h3>
                        {best !== null && (
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-extrabold text-blue-600">{best} EGP</span>
                              {worst !== best && (
                                <span className="text-xs text-slate-400">up to {worst} EGP</span>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-3 text-xs text-blue-600 font-medium group-hover:gap-2 transition-all">
                          Compare prices <ArrowRight className="w-3 h-3" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
