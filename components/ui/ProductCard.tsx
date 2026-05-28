"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingDown, Package, ArrowRight, Star, Heart, GitCompare, ShoppingBasket } from "lucide-react";
import { Product, Price, Store } from "@/lib/firestore";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useRouter } from "next/navigation";

interface Props {
  product: Product;
  prices: Price[];
  stores: Store[];
}

const CATEGORY_COLORS: Record<string, string> = {
  pharmacy: "bg-blue-100 text-blue-700",
  dairy: "bg-yellow-100 text-yellow-700",
  grains: "bg-orange-100 text-orange-700",
  oils: "bg-green-100 text-green-700",
  pantry: "bg-purple-100 text-purple-700",
  canned: "bg-red-100 text-red-700",
};

const CATEGORY_ICONS: Record<string, string> = {
  pharmacy: "💊",
  dairy: "🥛",
  grains: "🌾",
  oils: "🫙",
  pantry: "🍚",
  canned: "🥫",
  grocery: "🛒",
};

export default function ProductCard({ product, prices, stores }: Props) {
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const { toggle: toggleCompare, isComparing } = useCompare();
  const router = useRouter();

  const minPrice = prices.length
    ? Math.min(...prices.map((p) => p.price))
    : null;
  const maxPrice = prices.length
    ? Math.max(...prices.map((p) => p.price))
    : null;
  const cheapestPrice = prices.find((p) => p.price === minPrice);
  const cheapestStore = cheapestPrice
    ? stores.find((s) => s.id === cheapestPrice.storeId)
    : null;

  const savings =
    minPrice && maxPrice && maxPrice > minPrice ? maxPrice - minPrice : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group"
    >
      {/* Image Area */}
      <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <span className="text-6xl">
          {CATEGORY_ICONS[product.category] || "📦"}
        </span>
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              CATEGORY_COLORS[product.category] || "bg-slate-100 text-slate-600"
            }`}
          >
            {product.category}
          </span>
        </div>
        {/* Wishlist button — always visible */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
            isWishlisted(product.id)
              ? "bg-rose-500 text-white"
              : "bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? "fill-white" : ""}`} />
        </button>
        {savings > 0 && (
          <div className="absolute bottom-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Save {savings} EGP
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 mb-1 line-clamp-1">{product.nameAr}</p>

        {prices.length > 0 ? (
          <div className="mt-3 space-y-2">
            {/* Price Range */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">From</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-emerald-600">
                    {minPrice}
                  </span>
                  <span className="text-xs text-slate-500">EGP</span>
                </div>
              </div>
              {maxPrice !== minPrice && (
                <div className="text-right">
                  <span className="text-xs text-slate-500">Up to</span>
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-sm font-medium text-slate-400 line-through">
                      {maxPrice}
                    </span>
                    <span className="text-xs text-slate-400">EGP</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cheapest Store */}
            {cheapestStore && (
              <div className="flex items-center gap-1.5 bg-emerald-50 rounded-lg px-2.5 py-1.5">
                <Star className="w-3 h-3 text-emerald-600 fill-emerald-600 flex-shrink-0" />
                <span className="text-xs text-emerald-700 font-medium truncate">
                  Best: {cheapestStore.name}
                </span>
              </div>
            )}

            <p className="text-xs text-slate-400">
              {prices.length} store{prices.length !== 1 ? "s" : ""} compared
            </p>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 text-slate-400">
            <Package className="w-4 h-4" />
            <span className="text-xs">No prices yet</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <Link href={`/product/${product.id}`} className="flex-1">
            <motion.div
              whileHover={{ x: 2 }}
              className="flex items-center justify-between text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <span>See Prices</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
          <button
            onClick={(e) => { e.preventDefault(); toggleCompare(product); }}
            title="Compare"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
              isComparing(product.id)
                ? "bg-blue-500 border-blue-500 text-white"
                : "border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); router.push("/basket"); }}
            title="Add to Basket"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-all"
          >
            <ShoppingBasket className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
