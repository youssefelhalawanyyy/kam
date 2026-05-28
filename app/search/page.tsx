"use client";
import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, X, Package, Globe,
  Loader2, ExternalLink, TrendingDown, TrendingUp,
  ShoppingBag, Store, CheckCircle, Sparkles, ChevronDown,
  ArrowUpDown, Filter,
} from "lucide-react";
import Image from "next/image";
import ProductCard from "@/components/ui/ProductCard";
import AffiliateLinkWrapper from "@/components/ui/AffiliateLinkWrapper";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  getAllProducts, searchProducts, getAllStores,
  getPricesForProduct, Product, Store as StoreType, Price,
} from "@/lib/firestore";
import { MarketPriceResult } from "@/app/api/market-prices/route";

const CATEGORIES = [
  { id: "all",      label: "All",     emoji: "🛒" },
  { id: "pharmacy", label: "Pharmacy",emoji: "💊" },
  { id: "dairy",    label: "Dairy",   emoji: "🥛" },
  { id: "grains",   label: "Grains",  emoji: "🌾" },
  { id: "oils",     label: "Oils",    emoji: "🫙" },
  { id: "pantry",   label: "Pantry",  emoji: "🍚" },
  { id: "canned",   label: "Canned",  emoji: "🥫" },
];

const SEARCHING_STORES = [
  "Jumia", "Amazon EG", "Carrefour", "Hyper One", "Kheir Zaman",
  "Seoudi", "Metro", "Spinneys", "Gourmet", "Seif Pharmacy",
  "Saydalia", "Kazyon", "Monoprix", "Alfa Market", "BIM",
];

interface ProductWithPrices { product: Product; prices: Price[] }

/* ── Result card ─────────────────────────────────────────────────────────── */
function ResultCard({ result, rank }: { result: MarketPriceResult; rank?: number }) {
  const [imgErr, setImgErr] = useState(false);
  const isBest = rank === 0;

  return (
    <AffiliateLinkWrapper url={result.productUrl || ""} store={result.store} productName={result.productName} className="block">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(0,0,0,0.10)" }}
        className={`relative bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all group h-full flex flex-col ${
          isBest ? "border-emerald-300 shadow-emerald-100 shadow-md" : "border-slate-100 hover:border-emerald-200"
        }`}
      >
        {isBest && (
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
        )}
        {isBest && (
          <div className="absolute top-2 right-2 z-10 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingDown className="w-2.5 h-2.5" /> BEST PRICE
          </div>
        )}

        {/* Image */}
        <div className="relative h-40 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
          {result.imageUrl && !imgErr ? (
            <Image src={result.imageUrl} alt={result.productName} fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-contain p-3" onError={() => setImgErr(true)} unoptimized />
          ) : (
            <ShoppingBag className="w-10 h-10 text-slate-200" />
          )}
          <div className="absolute top-2 left-2 text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-sm"
            style={{ backgroundColor: result.storeColor }}>
            {result.store.replace(" Egypt", "").replace(" EG", "")}
          </div>
          {result.productUrl && (
            <div className="absolute top-2 right-2 bg-white/90 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow">
              <ExternalLink className="w-3 h-3 text-slate-600" />
            </div>
          )}
          {result.inStock === false && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-xs font-bold text-red-500 bg-white px-2 py-1 rounded-full shadow">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-[13px] font-semibold text-slate-800 line-clamp-2 leading-snug mb-1 flex-1">
            {result.productName}
          </p>
          {result.storeAr && (
            <p className="text-[11px] text-slate-400 mb-2" dir="rtl">{result.storeAr}</p>
          )}
          <div className="flex items-center justify-between mt-auto">
            <span className={`text-lg font-extrabold ${isBest ? "text-emerald-600" : "text-slate-800"}`}>
              {result.price.toFixed(2)}
              <span className="text-[11px] font-normal text-slate-400 ml-1">EGP</span>
            </span>
            {result.isLocalBrand && (
              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">🇪🇬 Local</span>
            )}
          </div>
        </div>
      </motion.div>
    </AffiliateLinkWrapper>
  );
}

/* ── Animated store search indicator ────────────────────────────────────── */
function SearchingIndicator({ query }: { query: string }) {
  const [visibleCount, setVisibleCount] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setVisibleCount(v => Math.min(v + 1, SEARCHING_STORES.length)), 180);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl px-5 py-4 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
        <span className="text-sm font-semibold text-blue-700">
          Searching <span className="text-blue-900">"{query}"</span> across Egyptian markets...
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SEARCHING_STORES.slice(0, visibleCount).map((s, i) => (
          <motion.span key={s} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-1 text-[11px] bg-white border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium shadow-sm">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> {s}
          </motion.span>
        ))}
        {visibleCount < SEARCHING_STORES.length && (
          <span className="text-[11px] text-blue-400 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> more...
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
function SearchContent() {
  const params    = useSearchParams();
  const router    = useRouter();
  const queryParam    = params.get("q") || "";
  const categoryParam = params.get("category") || "all";

  const [searchInput, setSearchInput] = useState(queryParam);
  const [category,    setCategory]    = useState(categoryParam);
  const [items,       setItems]       = useState<ProductWithPrices[]>([]);
  const [stores,      setStores]      = useState<StoreType[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [sortBy,      setSortBy]      = useState<"price_asc" | "price_desc" | "name">("price_asc");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const [webResults,       setWebResults]       = useState<MarketPriceResult[]>([]);
  const [localBrandResults,setLocalBrandResults] = useState<MarketPriceResult[]>([]);
  const [webLoading,       setWebLoading]       = useState(false);

  useEffect(() => { setSearchInput(queryParam); setCategory(categoryParam); }, [queryParam, categoryParam]);

  useEffect(() => {
    setStoreFilter("all");
    async function load() {
      setLoading(true);
      setWebResults([]);
      setLocalBrandResults([]);
      try {
        const [storeList, products] = await Promise.all([
          getAllStores(),
          queryParam ? searchProducts(queryParam) : getAllProducts(),
        ]);
        setStores(storeList);
        const filtered = category !== "all" ? products.filter(p => p.category === category) : products;
        const priceData = await Promise.all(
          filtered.map(async (product) => ({ product, prices: await getPricesForProduct(product.id) }))
        );
        setItems(priceData);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
      if (queryParam) fetchWeb(queryParam);
    }
    load();
  }, [queryParam, category]);

  async function fetchWeb(q: string) {
    setWebLoading(true);
    try {
      const res = await fetch(`/api/market-prices?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setWebResults(data.results || []);
      setLocalBrandResults(data.localBrandResults || []);
    } catch { /* silent */ }
    finally { setWebLoading(false); }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (searchInput.trim()) p.set("q", searchInput.trim());
    if (category !== "all") p.set("category", category);
    router.push(`/search?${p.toString()}`);
  };

  /* All web results combined */
  const allWebResults = useMemo(() => {
    const combined = [...webResults, ...localBrandResults];
    const sorted = combined.sort((a, b) =>
      sortBy === "price_asc" ? a.price - b.price :
      sortBy === "price_desc" ? b.price - a.price :
      a.productName.localeCompare(b.productName)
    );
    if (storeFilter === "all") return sorted;
    return sorted.filter(r => r.store === storeFilter || (r.isLocalBrand && storeFilter === "local"));
  }, [webResults, localBrandResults, sortBy, storeFilter]);

  /* Store list for filter chips */
  const storeNames = useMemo(() => {
    const names = new Set(webResults.map(r => r.store));
    return Array.from(names);
  }, [webResults]);

  const sortedFirestore = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortBy === "name") return a.product.name.localeCompare(b.product.name);
      const aMin = a.prices.length ? Math.min(...a.prices.map(p => p.price)) : Infinity;
      const bMin = b.prices.length ? Math.min(...b.prices.map(p => p.price)) : Infinity;
      return sortBy === "price_asc" ? aMin - bMin : bMin - aMin;
    });
  }, [items, sortBy]);

  const hasFirestore = sortedFirestore.length > 0;
  const hasWeb       = allWebResults.length > 0;
  const minPrice     = hasWeb ? Math.min(...allWebResults.map(r => r.price)) : 0;
  const maxPrice     = hasWeb ? Math.max(...allWebResults.map(r => r.price)) : 0;
  const bestResult   = hasWeb ? allWebResults.find(r => r.price === minPrice) : null;
  const totalSources = webResults.length + localBrandResults.length;

  /* ── JSX ──────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 pt-20">

      {/* ── Sticky search bar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-[60px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products across 20+ Egyptian stores..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm transition-all bg-slate-50 focus:bg-white"
                autoFocus={!queryParam}
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-md transition-all text-sm whitespace-nowrap">
              Search
            </button>
            <button type="button" onClick={() => setShowFilters(v => !v)}
              className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-emerald-300"
              }`}>
              <Filter className="w-4 h-4" />
            </button>
          </form>

          {/* Category chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  const p = new URLSearchParams();
                  if (searchInput.trim()) p.set("q", searchInput.trim());
                  if (cat.id !== "all") p.set("category", cat.id);
                  router.push(`/search?${p.toString()}`);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  category === cat.id ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Filters row */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden">
                <div className="flex items-center gap-4 pt-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500">Sort:</span>
                    {[
                      { v: "price_asc",  label: "Price ↑" },
                      { v: "price_desc", label: "Price ↓" },
                      { v: "name",       label: "Name A–Z" },
                    ].map(opt => (
                      <button key={opt.v} onClick={() => setSortBy(opt.v as typeof sortBy)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          sortBy === opt.v ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-emerald-50"
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {storeNames.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Store className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-500">Store:</span>
                      <button onClick={() => setStoreFilter("all")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          storeFilter === "all" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-emerald-50"
                        }`}>All</button>
                      {storeNames.map(s => (
                        <button key={s} onClick={() => setStoreFilter(s)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            storeFilter === s ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-emerald-50"
                          }`}>
                          {s.replace(" Egypt", "").replace(" EG", "")}
                        </button>
                      ))}
                      {localBrandResults.length > 0 && (
                        <button onClick={() => setStoreFilter("local")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            storeFilter === "local" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-amber-50"
                          }`}>🇪🇬 Local Brands</button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Best price banner ─────────────────────────────────────── */}
        {!webLoading && bestResult && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Best Price Found</p>
                <p className="text-sm font-semibold text-slate-800 line-clamp-1">{bestResult.productName}</p>
                <p className="text-xs text-slate-500">at {bestResult.store}</p>
              </div>
            </div>
            <div className="sm:ml-auto flex items-center gap-6">
              <div>
                <p className="text-2xl font-extrabold text-emerald-600">{minPrice.toFixed(2)} <span className="text-sm font-normal text-slate-500">EGP</span></p>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs text-slate-500">Price range</p>
                <p className="text-sm font-bold text-slate-700">
                  {minPrice.toFixed(0)} – {maxPrice.toFixed(0)} <span className="text-xs font-normal text-slate-400">EGP</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-slate-700">{totalSources} results</span>
                <span className="text-xs text-slate-400">from {storeNames.length} stores</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── BKAM tracked ─────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner text="Searching products..." /></div>
        ) : hasFirestore && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Package className="w-3 h-3 text-emerald-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">BKAM Price Tracker</h2>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{sortedFirestore.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedFirestore.map(({ product, prices }, idx) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <ProductCard product={product} prices={prices} stores={stores} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── Live market results ─────────────────────────────────── */}
        {queryParam && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-3 h-3 text-blue-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Live Market Prices</h2>
              {webLoading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
              {!webLoading && allWebResults.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{allWebResults.length}</span>
              )}
              {!webLoading && localBrandResults.length > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">🇪🇬 {localBrandResults.length} local</span>
              )}
            </div>

            {/* Searching indicator */}
            {webLoading && <SearchingIndicator query={queryParam} />}

            {/* Results grid */}
            {!webLoading && allWebResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {allWebResults.map((r, i) => (
                  <ResultCard key={`${r.store}-${i}`} result={r} rank={i} />
                ))}
              </div>
            )}

            {/* No results */}
            {!webLoading && !hasWeb && !hasFirestore && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">No results found</h3>
                <p className="text-slate-500 text-sm mb-4">Nothing found for "{queryParam}" — try different keywords</p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {["Rice", "Milk", "Sugar", "Oil", "Bread", "Eggs"].map(s => (
                    <button key={s} onClick={() => router.push(`/search?q=${s}`)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full hover:bg-emerald-100 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={() => router.push("/search")}
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                  ← Browse all products
                </button>
              </motion.div>
            )}
          </section>
        )}

        {/* ── Local brands CTA ─────────────────────────────────────── */}
        {queryParam && !webLoading && (
          <motion.a href={`/brands/search?q=${encodeURIComponent(queryParam)}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-5 py-4 hover:shadow-md transition-all group mb-6">
            <span className="text-3xl shrink-0">🇪🇬</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm">Search Egyptian Local Brands</p>
              <p className="text-slate-500 text-xs mt-0.5">Town Team · Dice · Asili · Young Noise · Okhtein · +30 more</p>
            </div>
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold text-sm shrink-0 group-hover:translate-x-1 transition-transform">
              Search &quot;{queryParam}&quot; <Sparkles className="w-4 h-4" />
            </span>
          </motion.a>
        )}

        {/* ── Empty browse state ────────────────────────────────────── */}
        {!queryParam && !loading && !hasFirestore && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-600">No products in this category yet</h3>
          </motion.div>
        )}

        {/* ── Landing state (no query) ─────────────────────────────── */}
        {!queryParam && !loading && hasFirestore && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              <span className="font-bold">Tip:</span> Search any product to compare prices across 20+ Egyptian stores including Jumia, Amazon, Carrefour, Hyper One, Kheir Zaman, Metro, and more — all in one place.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoadingSpinner text="Loading..." /></div>}>
      <SearchContent />
    </Suspense>
  );
}
