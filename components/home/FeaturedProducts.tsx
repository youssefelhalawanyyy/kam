"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getAllProducts, getAllStores, getPricesForProduct, Product, Store, Price } from "@/lib/firestore";

interface ProductWithPrices {
  product: Product;
  prices: Price[];
}

export default function FeaturedProducts() {
  const [items, setItems] = useState<ProductWithPrices[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [products, storeList] = await Promise.all([
          getAllProducts(),
          getAllStores(),
        ]);
        setStores(storeList);

        const priceData = await Promise.all(
          products.slice(0, 6).map(async (product) => ({
            product,
            prices: await getPricesForProduct(product.id),
          }))
        );
        setItems(priceData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="py-20 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              Featured Products
            </span>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              Popular Items Today
            </h2>
          </div>
          <Link
            href="/search"
            className="hidden sm:flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner text="Loading products..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(({ product, prices }, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
              >
                <ProductCard product={product} prices={prices} stores={stores} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/search">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              View All Products
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}
