"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Share2,
  Package,
  MapPin,
  TrendingDown,
  Trophy,
  Tag,
  Heart,
  GitCompare,
  ShoppingBasket,
} from "lucide-react";
import PriceTable from "@/components/ui/PriceTable";
import PriceHistoryChart from "@/components/ui/PriceHistoryChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ProductReviews from "@/components/ui/ProductReviews";
import WhatsAppShare from "@/components/ui/WhatsAppShare";
import SubmitPriceModal from "@/components/ui/SubmitPriceModal";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import {
  getProductById,
  getPricesForProduct,
  getAllStores,
  getPriceHistory,
  createPriceAlert,
  addToBasket,
  Product,
  Store,
  Price,
  PriceHistory,
} from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const CATEGORY_ICONS: Record<string, string> = {
  pharmacy: "💊",
  dairy: "🥛",
  grains: "🌾",
  oils: "🫙",
  pantry: "🍚",
  canned: "🥫",
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertPrice, setAlertPrice] = useState("");
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [prod, storeList] = await Promise.all([
          getProductById(id),
          getAllStores(),
        ]);
        setProduct(prod);
        setStores(storeList);

        if (prod) {
          const [priceList, hist] = await Promise.all([
            getPricesForProduct(id),
            getPriceHistory(id),
          ]);
          setPrices(priceList);
          setHistory(hist);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const minPrice = prices.length ? Math.min(...prices.map((p) => p.price)) : null;
  const maxPrice = prices.length ? Math.max(...prices.map((p) => p.price)) : null;
  const cheapestPrice = prices.find((p) => p.price === minPrice);
  const cheapestStore = cheapestPrice ? stores.find((s) => s.id === cheapestPrice.storeId) : null;
  const savings = minPrice && maxPrice ? maxPrice - minPrice : 0;

  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const { toggle: toggleCompare, isComparing } = useCompare();

  const handleAddToBasket = async () => {
    if (!user) {
      toast.error("Please sign in to use the basket");
      router.push("/auth/login");
      return;
    }
    try {
      await addToBasket(user.uid, id, product?.name || id);
      toast.success("Added to basket!");
    } catch {
      toast.error("Failed to add to basket");
    }
  };

  const handleSetAlert = async () => {
    if (!user) {
      toast.error("Please sign in to set price alerts");
      router.push("/auth/login");
      return;
    }
    const price = parseFloat(alertPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    try {
      await createPriceAlert(user.uid, id, price);
      toast.success("Price alert set! We'll notify you when the price drops.");
      setShowAlertModal(false);
      setAlertPrice("");
    } catch {
      toast.error("Failed to set alert");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-16">
        <LoadingSpinner size="lg" text="Loading product..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 pt-16">
        <Package className="w-16 h-16 text-slate-300" />
        <p className="text-xl font-bold text-slate-600">Product not found</p>
        <button
          onClick={() => router.back()}
          className="text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to results</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Product Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {/* Product Image */}
              <div className="h-56 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <span className="text-8xl">
                  {CATEGORY_ICONS[product.category] || "📦"}
                </span>
              </div>

              <div className="p-6">
                {/* Category */}
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  {product.category}
                </span>

                {/* Names */}
                <h1 className="text-xl font-bold text-slate-800 mt-3 leading-tight">
                  {product.name}
                </h1>
                <p className="text-slate-500 mt-1 text-lg" dir="rtl">
                  {product.nameAr}
                </p>

                {product.description && (
                  <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {product.barcode && (
                  <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                    <Tag className="w-3.5 h-3.5" />
                    Barcode: {product.barcode}
                  </div>
                )}

                {/* Price Summary */}
                {minPrice !== null && (
                  <div className="mt-5 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-semibold mb-2">
                      BEST PRICE TODAY
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-emerald-600">
                        {minPrice}
                      </span>
                      <span className="text-slate-500 text-sm">EGP</span>
                    </div>
                    {cheapestStore && (
                      <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-600">
                        <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                        {cheapestStore.name}
                        <span className="text-slate-400">·</span>
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {cheapestStore.location}
                      </div>
                    )}
                    {savings > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Save up to {savings} EGP vs. most expensive
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowAlertModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    <Bell className="w-4 h-4" />
                    Price Alert
                  </button>
                  <button
                    onClick={handleAddToBasket}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 text-sm font-medium rounded-xl transition-all"
                    title="Add to Basket"
                  >
                    <ShoppingBasket className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(id)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                      isWishlisted(id)
                        ? "bg-rose-100 hover:bg-rose-200 text-rose-600"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                    title="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted(id) ? "fill-rose-500" : ""}`} />
                  </button>
                  <button
                    onClick={() => product && toggleCompare(product)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                      isComparing(id)
                        ? "bg-blue-100 hover:bg-blue-200 text-blue-600"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    <GitCompare className="w-4 h-4" />
                  </button>
                  <WhatsAppShare
                    text={`${product.name} — best price in Egypt 🇪🇬`}
                    url={typeof window !== "undefined" ? window.location.href : ""}
                    className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4" />
                  </WhatsAppShare>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Prices & Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">Price Comparison</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{prices.length} stores compared</p>
                </div>
                <SubmitPriceModal productId={id} productName={product.name} />
              </div>
              <PriceTable prices={prices} stores={stores} productName={product.name} />
            </motion.div>

            {/* Price History Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 text-lg">
                  Price History
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Last 30 days — track price trends
                </p>
              </div>
              <div className="p-5">
                <PriceHistoryChart history={history} stores={stores} />
              </div>
            </motion.div>
            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ProductReviews productId={id} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Price Alert Modal */}
      {showAlertModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAlertModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Set Price Alert</h3>
                <p className="text-xs text-slate-500">
                  Get notified when price drops
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Set your target price for{" "}
              <strong>{product.name}</strong>. We'll notify you when any store
              reaches this price.
            </p>
            <div className="relative mb-4">
              <input
                type="number"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder="Enter target price in EGP"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                EGP
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAlertModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSetAlert}
                className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-all"
              >
                Set Alert
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
