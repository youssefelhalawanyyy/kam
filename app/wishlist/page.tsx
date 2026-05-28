"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, Package, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { getProductById, getPricesForProduct, getAllStores, Product, Price, Store } from "@/lib/firestore";
import ProductCard from "@/components/ui/ProductCard";

interface WishlistProduct { product: Product; prices: Price[] }

export default function WishlistPage() {
  const { user } = useAuth();
  const { items, toggle } = useWishlist();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      const storeList = await getAllStores();
      setStores(storeList);
      const loaded = await Promise.all(
        items.map(async (item) => {
          const [product, prices] = await Promise.all([
            getProductById(item.productId),
            getPricesForProduct(item.productId),
          ]);
          return product ? { product, prices } : null;
        })
      );
      setProducts(loaded.filter(Boolean) as WishlistProduct[]);
      setLoading(false);
    }
    load();
  }, [user, items]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 pt-16 px-4">
        <Heart className="w-16 h-16 text-slate-300" />
        <h1 className="text-2xl font-bold text-slate-800">Your Wishlist</h1>
        <p className="text-slate-500 text-center max-w-sm">Sign in to save products and track their prices.</p>
        <Link href="/auth/login" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition-all">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              Wishlist
            </h1>
            <p className="text-sm text-slate-500 mt-1">{items.length} saved product{items.length !== 1 ? "s" : ""}</p>
          </div>
          {items.length > 0 && (
            <Link href="/basket" className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all">
              Add to Basket <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-emerald-500" /></div>
        ) : items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">No saved products</h2>
            <p className="text-slate-400 mb-6">Tap the ❤️ on any product to save it here</p>
            <Link href="/search" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition-all">
              <Package className="w-4 h-4" /> Browse Products
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(({ product, prices }) => {
                return (
                  <motion.div key={product.id} layout
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}>
                    <div className="relative">
                      <ProductCard product={product} prices={prices} stores={stores} />
                      <button
                        onClick={() => toggle(product.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-all z-10"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
