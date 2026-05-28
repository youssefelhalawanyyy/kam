"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Loader2, ExternalLink, SlidersHorizontal,
  TrendingDown, TrendingUp, ShoppingBag, LayoutGrid, List, Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LOCAL_BRANDS, BRAND_CATEGORIES, LocalBrand } from "@/lib/localBrands";
import { LocalBrandResult } from "@/app/api/local-brands/route";

// ── Product card – grid view ───────────────────────────────────────────────────
function GridCard({ result }: { result: LocalBrandResult & { _featured?: boolean } }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.a
      href={result.productUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px -8px rgba(0,0,0,0.13)" }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-emerald-200 transition-colors group block relative"
    >
      {/* Sponsored ribbon */}
      {result._featured && (
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-end">
          <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-amber-900" /> Sponsored
          </span>
        </div>
      )}

      {/* Image area */}
      <div className="relative h-52 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
        {result.imageUrl && !imgError ? (
          <Image
            src={result.imageUrl}
            alt={result.productName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300">
            <ShoppingBag className="w-12 h-12" />
          </div>
        )}

        {/* Brand badge */}
        <span
          className="absolute bottom-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow"
          style={{ backgroundColor: result.brandColor }}
        >
          {result.brandName}
        </span>

        {/* Out of stock */}
        {result.inStock === false && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-bold text-rose-500 bg-white px-3 py-1 rounded-full shadow">
              Out of stock
            </span>
          </div>
        )}

        {/* Hover external icon */}
        <div className="absolute top-3 right-3 bg-white/90 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow">
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-3 min-h-[2.5rem]">
          {result.productName}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-extrabold text-emerald-600">{result.price.toFixed(0)}</span>
            <span className="text-xs text-slate-400 ml-1">EGP</span>
          </div>
          <span className="text-xs text-slate-400 group-hover:text-emerald-500 flex items-center gap-0.5 transition-colors">
            View <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.a>
  );
}

// ── Product card – list view ───────────────────────────────────────────────────
function ListCard({ result }: { result: LocalBrandResult & { _featured?: boolean } }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.a
      href={result.productUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 2 }}
      className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-3 hover:border-emerald-200 hover:shadow-sm transition-all group relative"
    >
      {/* Image */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center">
        {result.imageUrl && !imgError ? (
          <Image
            src={result.imageUrl}
            alt={result.productName}
            fill
            sizes="80px"
            className="object-contain p-1"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <ShoppingBag className="w-7 h-7 text-slate-300" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-1.5">
          {result.productName}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
            style={{ backgroundColor: result.brandColor }}
          >
            {result.brandName}
          </span>
          {result._featured && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-600" /> Sponsored
            </span>
          )}
          {result.inStock === false && (
            <span className="text-xs text-rose-400 font-medium">Out of stock</span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <span className="text-lg font-extrabold text-emerald-600">{result.price.toFixed(0)}</span>
          <span className="text-xs text-slate-400 ml-1">EGP</span>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
      </div>
    </motion.a>
  );
}

// ── Brand group ────────────────────────────────────────────────────────────────
function BrandGroup({
  brand,
  results,
  view,
}: {
  brand: LocalBrand;
  results: LocalBrandResult[];
  view: "grid" | "list";
}) {
  const [open, setOpen] = useState(true);
  const tagged = results.map((r) => ({ ...r, _featured: brand.featured }));

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 mb-4 w-full text-left group"
      >
        {/* Brand avatar */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
          style={{ backgroundColor: brand.color }}
        >
          {brand.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-base group-hover:text-emerald-700 transition-colors truncate">
              {brand.name}
            </h3>
            {brand.featured && (
              <span className="flex-shrink-0 flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-amber-600" /> Sponsored
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">{brand.nameAr} · {results.length} result{results.length !== 1 ? "s" : ""}</p>
        </div>

        <a
          href={brand.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="ml-auto flex-shrink-0 text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all"
        >
          Visit <ExternalLink className="w-3 h-3" />
        </a>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {view === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {tagged.map((r, i) => <GridCard key={i} result={r} />)}
              </div>
            ) : (
              <div className="space-y-2">
                {tagged.map((r, i) => <ListCard key={i} result={r} />)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-52 bg-slate-100" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        <div className="h-5 bg-slate-100 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function BrandsSearchContent() {
  const params = useSearchParams();
  const router = useRouter();

  const queryParam   = params.get("q")        || "";
  const categoryParam = params.get("category") || "all";
  const brandParam   = params.get("brand")    || "all";

  const [searchInput, setSearchInput] = useState(queryParam);
  const [category, setCategory]       = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [sortBy, setSortBy]           = useState<"price_asc" | "price_desc" | "brand">("brand");
  const [view, setView]               = useState<"grid" | "list">("grid");

  const [byBrand, setByBrand]         = useState<Array<{ brand: LocalBrand; results: LocalBrandResult[] }>>([]);
  const [allResults, setAllResults]   = useState<LocalBrandResult[]>([]);
  const [loading, setLoading]         = useState(false);
  const [searched, setSearched]       = useState(false);
  const [meta, setMeta]               = useState({ count: 0, brandsSearched: 0, brandsWithResults: 0 });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchInput(queryParam);
    setCategory(categoryParam);
    setSelectedBrand(brandParam);
  }, [queryParam, categoryParam, brandParam]);

  useEffect(() => {
    if (!queryParam) return;
    const p = new URLSearchParams({ q: queryParam });
    if (categoryParam !== "all") p.set("category", categoryParam);
    if (brandParam !== "all") p.set("brand", brandParam);
    doFetch(p.toString());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParam, categoryParam, brandParam]);

  async function doFetch(qs: string) {
    setLoading(true);
    setSearched(true);
    try {
      const res  = await fetch(`/api/local-brands?${qs}`);
      const data = await res.json();

      // Sort byBrand: featured brands first
      const groups: Array<{ brand: LocalBrand; results: LocalBrandResult[] }> = data.byBrand || [];
      groups.sort((a, b) => {
        if (a.brand.featured && !b.brand.featured) return -1;
        if (!a.brand.featured && b.brand.featured) return 1;
        return a.brand.name.localeCompare(b.brand.name);
      });

      setByBrand(groups);
      setAllResults(data.results || []);
      setMeta({
        count: data.count || 0,
        brandsSearched: data.brandsSearched || 0,
        brandsWithResults: data.brandsWithResults || 0,
      });
    } catch {
      setByBrand([]);
      setAllResults([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const p = new URLSearchParams({ q: searchInput.trim() });
    if (category !== "all") p.set("category", category);
    if (selectedBrand !== "all") p.set("brand", selectedBrand);
    router.push(`/brands/search?${p.toString()}`);
  };

  // Flat sorted results (for price-sorted view)
  const flatSorted = [...allResults].sort((a, b) =>
    sortBy === "price_asc" ? a.price - b.price : b.price - a.price
  );

  const minPrice = allResults.length ? Math.min(...allResults.map((r) => r.price)) : 0;
  const maxPrice = allResults.length ? Math.max(...allResults.map((r) => r.price)) : 0;

  const brandsInCat = LOCAL_BRANDS.filter(
    (b) => b.platform === "shopify" && (category === "all" || b.category === category)
  );

  const SUGGESTED = ["black hoodie", "cargo pants", "white dress", "oversized tee", "sneakers", "blazer", "denim jeans", "abaya"];

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* ── Sticky header ── */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">

          {/* Title + search bar */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🇪🇬</span>
            <h1 className="font-extrabold text-slate-800 text-xl tracking-tight">Egyptian Brand Search</h1>
            <span className="text-xs text-slate-400 hidden sm:block">{LOCAL_BRANDS.length} brands</span>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search hoodies, dresses, sneakers… across all Egyptian brands"
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                autoFocus={!queryParam}
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(""); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
            <button type="submit"
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-md transition-all text-sm whitespace-nowrap">
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {/* Category pills */}
            {BRAND_CATEGORIES.filter((c) => c.id !== "marketplace").map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setSelectedBrand("all");
                  if (queryParam) {
                    const p = new URLSearchParams({ q: queryParam });
                    if (cat.id !== "all") p.set("category", cat.id);
                    router.push(`/brands/search?${p.toString()}`);
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  category === cat.id
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 flex-shrink-0" />

            {/* Brand picker */}
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                if (queryParam) {
                  const p = new URLSearchParams({ q: queryParam });
                  if (category !== "all") p.set("category", category);
                  if (e.target.value !== "all") p.set("brand", e.target.value);
                  router.push(`/brands/search?${p.toString()}`);
                }
              }}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 flex-shrink-0 max-w-[160px]"
            >
              <option value="all">All brands ({brandsInCat.length})</option>
              {brandsInCat.map((b) => (
                <option key={b.id} value={b.id}>{b.name}{b.featured ? " ⭐" : ""}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Stats bar */}
        {searched && !loading && allResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-3 mb-6 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🇪🇬</span>
              <span className="text-sm font-semibold text-slate-700">
                {meta.count} products · {meta.brandsWithResults} brand{meta.brandsWithResults !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-1 text-sm">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-slate-500 text-xs">From</span>
                <span className="font-bold text-emerald-600">{minPrice.toFixed(0)} EGP</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-slate-500 text-xs">Up to</span>
                <span className="font-bold text-orange-500">{maxPrice.toFixed(0)} EGP</span>
              </div>

              <div className="h-4 w-px bg-slate-200" />

              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                >
                  <option value="brand">By brand</option>
                  <option value="price_asc">Price ↑ Low–High</option>
                  <option value="price_desc">Price ↓ High–Low</option>
                </select>
              </div>

              {/* View toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                <button onClick={() => setView("grid")}
                  className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-white shadow-sm text-emerald-600" : "text-slate-400"}`}>
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setView("list")}
                  className={`p-1.5 rounded-md transition-all ${view === "list" ? "bg-white shadow-sm text-emerald-600" : "text-slate-400"}`}>
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <>
            <div className="flex items-center gap-3 text-sm text-emerald-600 bg-emerald-50 rounded-2xl px-5 py-4 mb-6">
              <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
              Searching {brandsInCat.length} Egyptian brands for &quot;{queryParam}&quot;…
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          </>
        )}

        {/* Empty / no query */}
        {!loading && !searched && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-5 text-5xl">
              🇪🇬
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Search Egyptian Brands</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Type any product — hoodie, cargo pants, white dress, sneakers — and find it with real prices across all local Egyptian brands.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED.map((s) => (
                <button key={s}
                  onClick={() => router.push(`/brands/search?q=${encodeURIComponent(s)}`)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* No results */}
        {!loading && searched && allResults.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Nothing found in local brands</h3>
            <p className="text-slate-500 text-sm mb-5">
              &quot;{queryParam}&quot; wasn&apos;t found. Try a different term.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {SUGGESTED.map((s) => (
                <button key={s}
                  onClick={() => router.push(`/brands/search?q=${encodeURIComponent(s)}`)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-all">
                  {s}
                </button>
              ))}
            </div>
            <Link href={`/search?q=${encodeURIComponent(queryParam)}`}
              className="inline-block px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-all">
              Search all Egyptian markets instead →
            </Link>
          </motion.div>
        )}

        {/* Results */}
        {!loading && allResults.length > 0 && (
          <>
            {sortBy === "brand" ? (
              /* Grouped by brand — featured brands float to top */
              <div>
                {/* Sponsored section */}
                {byBrand.filter((g) => g.brand.featured).length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Sponsored Brands</span>
                    </div>
                    {byBrand
                      .filter((g) => g.brand.featured)
                      .map(({ brand, results }) => (
                        <BrandGroup key={brand.id} brand={brand} results={results} view={view} />
                      ))}
                    {byBrand.filter((g) => !g.brand.featured).length > 0 && (
                      <div className="border-t border-slate-100 pt-6 mt-2 mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">All Brands</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Non-sponsored */}
                {byBrand
                  .filter((g) => !g.brand.featured)
                  .map(({ brand, results }) => (
                    <BrandGroup key={brand.id} brand={brand} results={results} view={view} />
                  ))}
              </div>
            ) : (
              /* Flat price-sorted — featured results bubble up */
              <div>
                {view === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {flatSorted.map((r, i) => {
                      const brand = LOCAL_BRANDS.find((b) => b.id === r.brandId);
                      return <GridCard key={i} result={{ ...r, _featured: brand?.featured }} />;
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {flatSorted.map((r, i) => {
                      const brand = LOCAL_BRANDS.find((b) => b.id === r.brandId);
                      return <ListCard key={i} result={{ ...r, _featured: brand?.featured }} />;
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BrandsSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="flex items-center gap-3 text-emerald-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-medium">Loading…</span>
        </div>
      </div>
    }>
      <BrandsSearchContent />
    </Suspense>
  );
}
