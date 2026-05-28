"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Plus,
  Edit3,
  Save,
  X,
  Store as StoreIcon,
  TrendingUp,
  Loader2,
  Search,
  RefreshCw,
  Globe,
  TrendingDown,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAllProducts,
  getPricesForStore,
  getStoreByOwnerId,
  setPrice,
  addProduct,
  updateStore,
  Product,
  Store,
  Price,
} from "@/lib/firestore";
import { MarketPriceResult } from "@/app/api/market-prices/route";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

interface PriceEdit {
  productId: string;
  price: string;
}

export default function DashboardPage() {
  const { user, profile, isAdmin, isStore, loading: authLoading } = useAuth();
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [storePrices, setStorePrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);

  // Add product modal
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    nameAr: "",
    category: "pantry",
    description: "",
    barcode: "",
  });
  const [addingProduct, setAddingProduct] = useState(false);

  // Market prices lookup (modal)
  const [marketPrices, setMarketPrices] = useState<MarketPriceResult[]>([]);
  const [fetchingMarket, setFetchingMarket] = useState(false);
  const [marketSearched, setMarketSearched] = useState(false);

  // Market prices lookup (table inline)
  const [tableMarketPrices, setTableMarketPrices] = useState<Record<string, MarketPriceResult[]>>({});
  const [fetchingTableMarket, setFetchingTableMarket] = useState<string | null>(null);
  const [expandedMarketRow, setExpandedMarketRow] = useState<string | null>(null);

  // Store edit modal
  const [showEditStore, setShowEditStore] = useState(false);
  const [storeEdit, setStoreEdit] = useState({ name: "", location: "", address: "", phone: "" });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
    if (!authLoading && user && !isStore && !isAdmin) {
      toast.error("You need a store account to access the dashboard.");
      router.push("/");
    }
  }, [user, authLoading, isStore, isAdmin]);

  useEffect(() => {
    if (!user || (!isStore && !isAdmin)) return;
    loadData();
  }, [user, isStore, isAdmin]);

  async function loadData() {
    setLoading(true);
    try {
      const [storeData, productList] = await Promise.all([
        getStoreByOwnerId(user!.uid),
        getAllProducts(),
      ]);
      setStore(storeData);
      setProducts(productList);

      if (storeData) {
        const prices = await getPricesForStore(storeData.id);
        setStorePrices(prices);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const getPriceForProduct = (productId: string): number | null => {
    const p = storePrices.find((sp) => sp.productId === productId);
    return p ? p.price : null;
  };

  const handleSavePrice = async (productId: string) => {
    if (!store) {
      toast.error("No store associated with your account");
      return;
    }
    const priceStr = editingPrices[productId];
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    setSavingPriceId(productId);
    try {
      await setPrice(productId, store.id, price);
      toast.success("Price updated!");
      const updatedPrices = await getPricesForStore(store.id);
      setStorePrices(updatedPrices);
      setEditingPrices((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } catch {
      toast.error("Failed to update price");
    } finally {
      setSavingPriceId(null);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.nameAr) {
      toast.error("Name in Arabic and English are required");
      return;
    }
    setAddingProduct(true);
    try {
      await addProduct(newProduct as any);
      toast.success("Product added!");
      const updatedProducts = await getAllProducts();
      setProducts(updatedProducts);
      setShowAddProduct(false);
      setNewProduct({ name: "", nameAr: "", category: "pantry", description: "", barcode: "" });
    } catch {
      toast.error("Failed to add product");
    } finally {
      setAddingProduct(false);
    }
  };

  const fetchTableMarketPrices = async (productId: string, productName: string) => {
    if (expandedMarketRow === productId) {
      setExpandedMarketRow(null);
      return;
    }
    setFetchingTableMarket(productId);
    setExpandedMarketRow(productId);
    try {
      const res = await fetch(`/api/market-prices?q=${encodeURIComponent(productName.trim())}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTableMarketPrices((prev) => ({ ...prev, [productId]: data.results || [] }));
    } catch {
      toast.error("Could not fetch market prices");
    } finally {
      setFetchingTableMarket(null);
    }
  };

  const fetchMarketPrices = async (productName: string) => {
    if (!productName || productName.trim().length < 2) return;
    setFetchingMarket(true);
    setMarketSearched(false);
    try {
      const res = await fetch(`/api/market-prices?q=${encodeURIComponent(productName.trim())}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMarketPrices(data.results || []);
      setMarketSearched(true);
      if ((data.results || []).length === 0) {
        toast("No market prices found for this product.", { icon: "🔍" });
      }
    } catch {
      toast.error("Could not fetch market prices");
    } finally {
      setFetchingMarket(false);
    }
  };

  const handleUpdateStore = async () => {
    if (!store) return;
    try {
      await updateStore(store.id, storeEdit);
      toast.success("Store updated!");
      setStore({ ...store, ...storeEdit });
      setShowEditStore(false);
    } catch {
      toast.error("Failed to update store");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nameAr.includes(search)
  );

  const pricesSet = storePrices.length;
  const totalRevenue = storePrices.reduce((s, p) => s + p.price, 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-16">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-1">
              <LayoutDashboard className="w-4 h-4" />
              Store Dashboard
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              {store?.name || "My Store"}
            </h1>
            {store?.location && (
              <p className="text-slate-500 text-sm mt-0.5">{store.location}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => {
                setStoreEdit({
                  name: store?.name || "",
                  location: store?.location || "",
                  address: store?.address || "",
                  phone: store?.phone || "",
                });
                setShowEditStore(true);
              }}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm flex items-center gap-2 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Edit Store
            </button>
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Package, label: "Total Products", value: products.length, color: "bg-blue-50 text-blue-600", iconBg: "bg-blue-100" },
            { icon: DollarSign, label: "Prices Listed", value: pricesSet, color: "bg-emerald-50 text-emerald-600", iconBg: "bg-emerald-100" },
            { icon: TrendingUp, label: "Avg Price (EGP)", value: pricesSet ? Math.round(totalRevenue / pricesSet) : 0, color: "bg-purple-50 text-purple-600", iconBg: "bg-purple-100" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`${stat.color} rounded-2xl p-5 border border-opacity-20`}
            >
              <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-70 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Products & Prices Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 flex items-center gap-4">
            <div className="flex-1">
              <h2 className="font-bold text-slate-800">Product Prices</h2>
              <p className="text-sm text-slate-500">Update prices for your store</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 w-48"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Market Prices</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Current Price</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Update Price</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, idx) => {
                  const currentPrice = getPriceForProduct(product.id);
                  const isEditing = editingPrices[product.id] !== undefined;
                  const isSaving = savingPriceId === product.id;

                  const rowMarketPrices = tableMarketPrices[product.id] || [];
                  const isRowFetching = fetchingTableMarket === product.id;
                  const isRowExpanded = expandedMarketRow === product.id;

                  return (
                    <React.Fragment key={product.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{product.name}</p>
                          <p className="text-xs text-slate-400" dir="rtl">{product.nameAr}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      {/* Market Prices Cell */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => fetchTableMarketPrices(product.id, product.name)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            isRowExpanded
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                          }`}
                        >
                          {isRowFetching ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Globe className="w-3.5 h-3.5" />
                          )}
                          {isRowFetching
                            ? "Fetching..."
                            : isRowExpanded
                            ? `${rowMarketPrices.length} found`
                            : "Check Market"}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        {currentPrice !== null ? (
                          <span className="font-bold text-emerald-600">
                            {currentPrice} EGP
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="relative w-32">
                          <input
                            type="number"
                            placeholder={currentPrice?.toString() || "Price"}
                            value={editingPrices[product.id] || ""}
                            onChange={(e) =>
                              setEditingPrices((prev) => ({
                                ...prev,
                                [product.id]: e.target.value,
                              }))
                            }
                            className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            EGP
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleSavePrice(product.id)}
                          disabled={!editingPrices[product.id] || isSaving}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            editingPrices[product.id]
                              ? "bg-emerald-500 text-white hover:bg-emerald-600"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          Save
                        </button>
                      </td>
                    </motion.tr>
                    {/* Expandable market prices row */}
                    <AnimatePresence>
                      {isRowExpanded && (
                        <tr>
                          <td colSpan={6} className="px-5 pb-3 pt-0">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              {isRowFetching ? (
                                <div className="flex items-center gap-2 text-xs text-blue-500 py-2 bg-blue-50 rounded-xl px-3">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Searching Egyptian markets...
                                </div>
                              ) : rowMarketPrices.length === 0 ? (
                                <div className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2">
                                  No market prices found online for &quot;{product.name}&quot;.
                                </div>
                              ) : (
                                <div className="bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
                                  <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5" />
                                    Egyptian market prices for &quot;{product.name}&quot;
                                    <span className="ml-auto font-normal text-blue-500">
                                      Min: {Math.min(...rowMarketPrices.map((m) => m.price)).toFixed(2)} EGP
                                      {" · "}
                                      Max: {Math.max(...rowMarketPrices.map((m) => m.price)).toFixed(2)} EGP
                                    </span>
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {rowMarketPrices.map((mp, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-3 py-1.5 text-xs"
                                      >
                                        <span
                                          className="font-semibold px-1.5 py-0.5 rounded text-white text-xs"
                                          style={{ backgroundColor: mp.storeColor }}
                                        >
                                          {mp.store}
                                        </span>
                                        <span className="font-bold text-emerald-600">{mp.price.toFixed(2)} EGP</span>
                                        {mp.productUrl && (
                                          <a
                                            href={mp.productUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 hover:text-blue-500"
                                          >
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddProduct(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-800 text-lg">Add New Product</h3>
                <button onClick={() => { setShowAddProduct(false); setMarketPrices([]); setMarketSearched(false); }}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-3">
                {/* Name field with market lookup button */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Product name (English)"
                    value={newProduct.name}
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, name: e.target.value });
                      setMarketSearched(false);
                      setMarketPrices([]);
                    }}
                    onBlur={(e) => {
                      if (e.target.value.trim().length >= 3) {
                        fetchMarketPrices(e.target.value);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => fetchMarketPrices(newProduct.name)}
                    disabled={fetchingMarket || newProduct.name.trim().length < 2}
                    title="Fetch prices from Egyptian markets"
                    className="px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl border border-blue-200 disabled:opacity-40 transition-all flex items-center gap-1.5 text-xs font-medium whitespace-nowrap"
                  >
                    {fetchingMarket ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                    {fetchingMarket ? "Searching..." : "Find Prices"}
                  </button>
                </div>

                {/* Market Prices Panel */}
                <AnimatePresence>
                  {(fetchingMarket || marketSearched) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-xs font-semibold text-blue-700">
                            Egyptian Market Prices
                          </span>
                          {marketSearched && marketPrices.length > 0 && (
                            <span className="ml-auto text-xs text-blue-500">
                              {marketPrices.length} found
                            </span>
                          )}
                        </div>

                        {fetchingMarket && (
                          <div className="flex items-center gap-2 text-xs text-blue-500 py-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Searching Carrefour, Kheir Zaman, Seoudi, Metro...
                          </div>
                        )}

                        {marketSearched && marketPrices.length === 0 && (
                          <p className="text-xs text-slate-500 py-1">
                            No prices found online. Enter your price manually.
                          </p>
                        )}

                        {marketSearched && marketPrices.length > 0 && (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {marketPrices.map((mp, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100 hover:border-emerald-200 transition-all group"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="text-xs font-semibold px-1.5 py-0.5 rounded text-white"
                                      style={{ backgroundColor: mp.storeColor }}
                                    >
                                      {mp.store}
                                    </span>
                                    {mp.productUrl && (
                                      <a
                                        href={mp.productUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                      </a>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 truncate mt-0.5">
                                    {mp.productName}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-3">
                                  <span className="font-bold text-sm text-emerald-600">
                                    {mp.price.toFixed(2)} EGP
                                  </span>
                                </div>
                              </div>
                            ))}

                            {/* Min/Max summary */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-blue-100 mt-1">
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                                Lowest: <span className="font-semibold text-emerald-600">
                                  {Math.min(...marketPrices.map((m) => m.price)).toFixed(2)} EGP
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                                Highest: <span className="font-semibold text-orange-600">
                                  {Math.max(...marketPrices.map((m) => m.price)).toFixed(2)} EGP
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  type="text"
                  placeholder="اسم المنتج (عربي)"
                  value={newProduct.nameAr}
                  onChange={(e) => setNewProduct({ ...newProduct, nameAr: e.target.value })}
                  dir="rtl"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {["pharmacy", "dairy", "grains", "oils", "pantry", "canned"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Barcode (optional)"
                  value={newProduct.barcode}
                  onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => { setShowAddProduct(false); setMarketPrices([]); setMarketSearched(false); }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  disabled={addingProduct}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {addingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Add Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Store Modal */}
      <AnimatePresence>
        {showEditStore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditStore(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-800 text-lg">Edit Store Info</h3>
                <button onClick={() => setShowEditStore(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Store name"
                  value={storeEdit.name}
                  onChange={(e) => setStoreEdit({ ...storeEdit, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <input
                  type="text"
                  placeholder="Location (e.g. Nasr City)"
                  value={storeEdit.location}
                  onChange={(e) => setStoreEdit({ ...storeEdit, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <input
                  type="text"
                  placeholder="Full address"
                  value={storeEdit.address}
                  onChange={(e) => setStoreEdit({ ...storeEdit, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <input
                  type="text"
                  placeholder="Phone number"
                  value={storeEdit.phone}
                  onChange={(e) => setStoreEdit({ ...storeEdit, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowEditStore(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStore}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
