"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Filter, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getAllProducts, getPricesForProduct, getAllStores, Product, Price, Store } from "@/lib/firestore";

const CATEGORY_META: Record<string, { label: string; labelAr: string; icon: string; color: string; description: string }> = {
  pharmacy:  { label: "Pharmacy",    labelAr: "صيدلية",  icon: "💊", color: "bg-blue-50 text-blue-700 border-blue-200",    description: "Medicines, vitamins, personal care & health products" },
  dairy:     { label: "Dairy",       labelAr: "ألبان",   icon: "🥛", color: "bg-sky-50 text-sky-700 border-sky-200",        description: "Milk, cheese, yogurt, butter & dairy essentials" },
  grains:    { label: "Grains",      labelAr: "حبوب",    icon: "🌾", color: "bg-amber-50 text-amber-700 border-amber-200",  description: "Rice, wheat, flour & breakfast cereals" },
  oils:      { label: "Oils",        labelAr: "زيوت",    icon: "🫙", color: "bg-yellow-50 text-yellow-700 border-yellow-200", description: "Cooking oils, olive oil, ghee & spreads" },
  pantry:    { label: "Pantry",      labelAr: "مؤونة",   icon: "🍚", color: "bg-orange-50 text-orange-700 border-orange-200", description: "Pasta, sugar, salt, spices & dry goods" },
  canned:    { label: "Canned Goods",labelAr: "معلبات",  icon: "🥫", color: "bg-red-50 text-red-700 border-red-200",       description: "Canned vegetables, tuna, beans & preserved foods" },
  beverages: { label: "Beverages",   labelAr: "مشروبات", icon: "🧃", color: "bg-green-50 text-green-700 border-green-200",  description: "Juices, water, soft drinks, tea & coffee" },
  snacks:    { label: "Snacks",      labelAr: "وجبات خفيفة", icon: "🍿", color: "bg-pink-50 text-pink-700 border-pink-200", description: "Chips, biscuits, chocolate & confectionery" },
  cleaning:  { label: "Cleaning",    labelAr: "نظافة",   icon: "🧹", color: "bg-cyan-50 text-cyan-700 border-cyan-200",    description: "Detergents, cleaning supplies & household products" },
  baby:      { label: "Baby",        labelAr: "أطفال",   icon: "👶", color: "bg-purple-50 text-purple-700 border-purple-200", description: "Baby food, diapers, formula & baby care" },
};

const SORT_OPTIONS = [
  { id: "name", label: "Name A-Z" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "stores", label: "Most Stores" },
];

interface ProductWithPrices { product: Product; prices: Price[] }

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const meta = CATEGORY_META[slug];

  const [products, setProducts] = useState<ProductWithPrices[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("name");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [allProds, storeList] = await Promise.all([getAllProducts(), getAllStores()]);
      const catProds = allProds.filter((p) =>
        slug === "all" ? true : p.category === slug
      );
      const withPrices = await Promise.all(
        catProds.map(async (product) => {
          const prices = await getPricesForProduct(product.id);
          return { product, prices };
        })
      );
      setProducts(withPrices);
      setStores(storeList);
      setLoading(false);
    }
    load();
  }, [slug]);

  const sorted = [...products].sort((a, b) => {
    const aMin = a.prices.length ? Math.min(...a.prices.map((p) => p.price)) : Infinity;
    const bMin = b.prices.length ? Math.min(...b.prices.map((p) => p.price)) : Infinity;
    if (sort === "name") return a.product.name.localeCompare(b.product.name);
    if (sort === "price-asc") return aMin - bMin;
    if (sort === "price-desc") return bMin - aMin;
    if (sort === "stores") return b.prices.length - a.prices.length;
    return 0;
  });

  if (!meta && slug !== "all") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-600 mb-4">Category not found</p>
          <Link href="/search" className="text-emerald-600 hover:text-emerald-700 font-medium">Browse all products →</Link>
        </div>
      </div>
    );
  }

  const display = meta || { label: "All Products", labelAr: "كل المنتجات", icon: "🛒", color: "bg-slate-50 text-slate-700 border-slate-200", description: "Browse all products across all categories" };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Category Hero */}
      <div className={`border-b ${display.color} py-10`}>
        <div className="max-w-6xl mx-auto px-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-4 opacity-70 hover:opacity-100 transition-opacity">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{display.icon}</span>
            <div>
              <h1 className="text-3xl font-extrabold">{display.label}</h1>
              <p className="text-lg opacity-75 mt-0.5" dir="rtl">{display.labelAr}</p>
              <p className="text-sm opacity-60 mt-1">{display.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Subcategory links */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          <Link href="/category/all"
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              slug === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
            }`}
          >
            🛒 All
          </Link>
          {Object.entries(CATEGORY_META).map(([id, m]) => (
            <Link key={id} href={`/category/${id}`}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                slug === id ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              {m.icon} {m.label}
            </Link>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {loading ? "Loading..." : `${sorted.length} products`}
          </p>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Loading products..." />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <span className="text-5xl block mb-4">{display.icon}</span>
            <p className="text-slate-500 font-medium">No products in this category yet</p>
            <Link href="/search" className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              Browse all products →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.map(({ product, prices }, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}>
                <ProductCard
                  product={product}
                  prices={prices}
                  stores={stores}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
