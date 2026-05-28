"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  Store as StoreIcon,
  Package,
  Mail,
  TrendingUp,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Loader2,
  Download,
  Search,
  BarChart2,
  Activity,
  Eye,
  Globe,
  Clock,
  Wifi,
  LayoutGrid,
  CheckSquare,
  Star,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import {
  getAllUsers,
  getAllStores,
  getAllProducts,
  getAllSubscribers,
  addStore,
  deleteProduct,
  updateUserProfile,
  getStoreClaims,
  setStoreFeatured,
  UserProfile,
  Store,
  Product,
  Subscriber,
  StoreClaim,
} from "@/lib/firestore";
import StoreClaims from "@/components/admin/StoreClaims";
import RevenueTab from "@/components/admin/RevenueTab";
import {
  getPageViewsStats,
  subscribeToActiveSessions,
  ActiveSession,
} from "@/lib/analytics";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { format } from "date-fns";

type Tab = "overview" | "traffic" | "users" | "stores" | "products" | "subscribers" | "claims" | "featured" | "revenue";

function FeaturedStoreRow({
  store,
  onUpdate,
}: {
  store: Store;
  onUpdate: (s: Store) => void;
}) {
  const [featured, setFeatured] = React.useState(store.featured || false);
  const [until, setUntil] = React.useState<string>("");
  const [label, setLabel] = React.useState(store.featuredLabel || "");
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const untilDate = until ? new Date(until) : null;
      await setStoreFeatured(store.id, featured, untilDate, label);
      onUpdate({ ...store, featured, featuredLabel: label || null });
      toast.success("Store updated!");
    } catch {
      toast.error("Failed to update store");
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/70">
      <td className="px-5 py-3">
        <p className="text-sm font-semibold text-slate-800">{store.name}</p>
        <p className="text-xs text-slate-400">{store.location}</p>
      </td>
      <td className="px-5 py-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
        </label>
      </td>
      <td className="px-5 py-3">
        <input
          type="date"
          value={until}
          onChange={(e) => setUntil(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </td>
      <td className="px-5 py-3">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Sponsored"
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 w-28"
        />
      </td>
      <td className="px-5 py-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1"
        >
          {saving && <Loader2 className="w-3 h-3 animate-spin" />}
          Save
        </button>
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [storeClaims, setStoreClaims] = useState<StoreClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Traffic state
  const [trafficStats, setTrafficStats] = useState<{
    total: number;
    today: number;
    last7Days: number;
    last30Days: number;
    byPage: Record<string, number>;
    byDay: { date: string; views: number }[];
    uniqueSessions: number;
  } | null>(null);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const activeUnsubRef = useRef<(() => void) | null>(null);

  // Add Store Modal
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStore, setNewStore] = useState({ name: "", nameAr: "", location: "", address: "", phone: "" });
  const [addingStore, setAddingStore] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error("Admin access required");
      router.push("/");
    }
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadData();
    // Subscribe to live active sessions
    activeUnsubRef.current = subscribeToActiveSessions(setActiveSessions);
    return () => {
      activeUnsubRef.current?.();
    };
  }, [user, isAdmin]);

  async function loadData() {
    setLoading(true);
    try {
      // Load each independently so one failure doesn't kill the rest
      const [uRes, sRes, pRes, subRes, claimsRes] = await Promise.allSettled([
        getAllUsers(),
        getAllStores(),
        getAllProducts(),
        getAllSubscribers(),
        getStoreClaims("pending"),
      ]);
      if (uRes.status === "fulfilled") setUsers(uRes.value);
      else console.warn("Users read failed (check Firestore rules):", uRes.reason);
      if (sRes.status === "fulfilled") setStores(sRes.value);
      if (pRes.status === "fulfilled") setProducts(pRes.value);
      if (subRes.status === "fulfilled") setSubscribers(subRes.value);
      else console.warn("Subscribers read failed (check Firestore rules):", subRes.reason);
      if (claimsRes.status === "fulfilled") setStoreClaims(claimsRes.value);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load some data — check browser console");
    } finally {
      setLoading(false);
    }
  }

  async function handleReseed() {
    if (!confirm("Re-seed the database with sample Egyptian products, stores, and prices?")) return;
    const toastId = toast.loading("Seeding database...");
    try {
      // Force seed by calling the API route
      const res = await fetch("/api/seed/force", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Database seeded! Refreshing...", { id: toastId });
        await loadData();
      } else {
        toast.error("Seed failed: " + (data.error || "unknown error"), { id: toastId });
      }
    } catch {
      toast.error("Seed request failed", { id: toastId });
    }
  }

  async function loadTrafficStats() {
    setTrafficLoading(true);
    try {
      const stats = await getPageViewsStats();
      setTrafficStats(stats);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load traffic data");
    } finally {
      setTrafficLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "traffic" && !trafficStats) {
      loadTrafficStats();
    }
  }, [tab]);

  const handleAddStore = async () => {
    if (!newStore.name) { toast.error("Store name is required"); return; }
    setAddingStore(true);
    try {
      await addStore(newStore as any);
      toast.success("Store added!");
      await loadData();
      setShowAddStore(false);
      setNewStore({ name: "", nameAr: "", location: "", address: "", phone: "" });
    } catch { toast.error("Failed to add store"); }
    finally { setAddingStore(false); }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleChangeRole = async (uid: string, role: "user" | "store" | "admin") => {
    try {
      await updateUserProfile(uid, { role });
      setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, role } : u)));
      toast.success("Role updated!");
    } catch { toast.error("Failed to update role"); }
  };

  const exportSubscribers = () => {
    const csv = [
      "Name,Email,Joined",
      ...subscribers.map(
        (s) =>
          `"${s.name || ""}","${s.email}","${
            s.createdAt
              ? format((s.createdAt as any).toDate?.() || new Date(s.createdAt as any), "yyyy-MM-dd")
              : ""
          }"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bkam_subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Subscribers exported!");
  };

  const TABS: { id: Tab; label: string; icon: any; count?: number; badge?: string }[] = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    {
      id: "traffic",
      label: "Traffic",
      icon: Activity,
      badge: activeSessions.length > 0 ? `${activeSessions.length} live` : undefined,
    },
    { id: "users", label: "Users", icon: Users, count: users.length },
    { id: "stores", label: "Stores", icon: StoreIcon, count: stores.length },
    { id: "products", label: "Products", icon: Package, count: products.length },
    { id: "subscribers", label: "Subscribers", icon: Mail, count: subscribers.length },
    { id: "claims", label: "Claims", icon: CheckSquare, count: storeClaims.filter((c) => c.status === "pending").length },
    { id: "featured", label: "Featured", icon: Star },
    { id: "revenue", label: "Revenue", icon: DollarSign },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-16">
        <LoadingSpinner size="lg" text="Loading admin panel..." />
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nameAr.includes(search)
  );
  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Top pages sorted by views
  const topPages = trafficStats
    ? Object.entries(trafficStats.byPage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    : [];

  // Format date for chart
  const chartData = trafficStats?.byDay.map((d) => ({
    date: d.date.slice(5), // MM-DD
    views: d.views,
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm mb-1">
              <Shield className="w-4 h-4" />
              Admin Panel
            </div>
            <h1 className="text-2xl font-bold text-slate-800">BKAM Admin</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {activeSessions.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl text-xs font-semibold text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {activeSessions.length} live user{activeSessions.length !== 1 ? "s" : ""}
              </div>
            )}
            {products.length === 0 && (
              <button
                onClick={handleReseed}
                className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-sm flex items-center gap-2 transition-all font-semibold"
              >
                <Package className="w-4 h-4" />
                Seed Database
              </button>
            )}
            <button
              onClick={() => { loadData(); if (tab === "traffic") loadTrafficStats(); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-white/20" : "bg-slate-100"}`}>
                  {t.count}
                </span>
              )}
              {t.badge && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  tab === t.id ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Users, label: "Total Users", value: users.length, color: "blue" },
                { icon: StoreIcon, label: "Partner Stores", value: stores.length, color: "emerald" },
                { icon: Package, label: "Products", value: products.length, color: "orange" },
                { icon: Mail, label: "Subscribers", value: subscribers.length, color: "purple" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`bg-${stat.color}-50 rounded-2xl p-5`}
                >
                  <div className={`w-10 h-10 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                  <p className={`text-sm text-${stat.color}-600 opacity-70 mt-0.5`}>{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800">Recent Registrations</h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {users.slice(0, 8).map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {(u.name || u.email || "U")[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{u.name || "—"}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.role === "admin" ? "bg-purple-100 text-purple-700" :
                        u.role === "store" ? "bg-blue-100 text-blue-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registered Stores */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800">Registered Stores</h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {stores.slice(0, 8).map((s) => (
                    <div key={s.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                          <StoreIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-500">{s.location || "—"}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                  ))}
                  {stores.length === 0 && (
                    <p className="text-sm text-slate-400 px-5 py-4">No stores yet.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Traffic Tab ── */}
        {tab === "traffic" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {trafficLoading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner text="Loading traffic data..." />
              </div>
            ) : (
              <>
                {/* Live Users Banner */}
                <div className={`flex items-center gap-3 rounded-2xl px-5 py-4 mb-6 border ${
                  activeSessions.length > 0
                    ? "bg-green-50 border-green-200"
                    : "bg-slate-50 border-slate-200"
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activeSessions.length > 0 ? "bg-green-100" : "bg-slate-100"
                  }`}>
                    <Wifi className={`w-5 h-5 ${activeSessions.length > 0 ? "text-green-600" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {activeSessions.length} Active User{activeSessions.length !== 1 ? "s" : ""} Right Now
                    </p>
                    <p className="text-xs text-slate-500">Users active in the last 5 minutes</p>
                  </div>
                  {activeSessions.length > 0 && (
                    <div className="ml-auto flex flex-wrap gap-2">
                      {activeSessions.slice(0, 5).map((s) => (
                        <div key={s.id} className="flex items-center gap-1.5 bg-white border border-green-100 rounded-lg px-2.5 py-1 text-xs">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-slate-600 font-medium">{s.page}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: Eye, label: "Total Page Views", value: trafficStats?.total ?? 0, color: "blue", sub: "all time" },
                    { icon: Clock, label: "Today", value: trafficStats?.today ?? 0, color: "emerald", sub: "views today" },
                    { icon: TrendingUp, label: "Last 7 Days", value: trafficStats?.last7Days ?? 0, color: "orange", sub: "page views" },
                    { icon: Globe, label: "Unique Sessions", value: trafficStats?.uniqueSessions ?? 0, color: "purple", sub: "all time" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`bg-${stat.color}-50 rounded-2xl p-5`}
                    >
                      <div className={`w-10 h-10 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-3`}>
                        <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                      </div>
                      <p className={`text-2xl font-bold text-${stat.color}-700`}>
                        {stat.value.toLocaleString()}
                      </p>
                      <p className={`text-sm text-${stat.color}-600 opacity-70 mt-0.5`}>{stat.label}</p>
                      <p className={`text-xs text-${stat.color}-500 opacity-60`}>{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-800">Page Views — Last 14 Days</h2>
                    <button
                      onClick={loadTrafficStats}
                      className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh
                    </button>
                  </div>
                  {chartData.every((d) => d.views === 0) ? (
                    <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                      No page view data yet — views will appear here as users visit the site.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          fill="url(#viewsGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Top Pages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                      <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-purple-600" />
                        Top Pages
                      </h2>
                    </div>
                    {topPages.length === 0 ? (
                      <p className="text-sm text-slate-400 px-5 py-6">No page view data yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {topPages.map(([page, count], i) => {
                          const maxViews = topPages[0][1];
                          return (
                            <div key={page} className="flex items-center gap-3 px-5 py-3">
                              <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{page}</p>
                                <div className="w-full bg-slate-100 rounded-full h-1 mt-1">
                                  <div
                                    className="bg-purple-500 h-1 rounded-full"
                                    style={{ width: `${(count / maxViews) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-bold text-slate-600 ml-2 flex-shrink-0">
                                {count.toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Live Sessions */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-600" />
                        Live Sessions
                      </h2>
                      {activeSessions.length > 0 && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                          {activeSessions.length} online
                        </span>
                      )}
                    </div>
                    {activeSessions.length === 0 ? (
                      <div className="px-5 py-6 text-sm text-slate-400">
                        No active sessions right now. Sessions appear when users are browsing the site.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                        {activeSessions.map((s) => (
                          <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-700">{s.page}</p>
                              <p className="text-xs text-slate-400">Session: {s.id.slice(0, 8)}…</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ── Users Tab ── */}
        {tab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <div className="flex-1">
                  <h2 className="font-bold text-slate-800">All Users</h2>
                  <p className="text-sm text-slate-500">{users.length} registered</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 w-48"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Change Role</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {(u.name || u.email || "U")[0].toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-800">{u.name || "—"}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{u.email}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            u.role === "admin" ? "bg-purple-100 text-purple-700" :
                            u.role === "store" ? "bg-blue-100 text-blue-700" :
                            "bg-emerald-100 text-emerald-700"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value as any)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          >
                            <option value="user">User</option>
                            <option value="store">Store Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={u.plan || "free"}
                            onChange={async (e) => {
                              const plan = e.target.value as "free" | "premium";
                              try {
                                await updateUserProfile(u.id, { plan });
                                setUsers((prev) => prev.map((usr) => (usr.id === u.id ? { ...usr, plan } : usr)));
                                toast.success("Plan updated!");
                              } catch { toast.error("Failed to update plan"); }
                            }}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Stores Tab ── */}
        {tab === "stores" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{stores.length} registered stores</p>
              <button
                onClick={() => setShowAddStore(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Store
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store, i) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                      <StoreIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-medium">
                      Active
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800">{store.name}</h3>
                  {store.nameAr && <p className="text-sm text-slate-500" dir="rtl">{store.nameAr}</p>}
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    {store.location && <p>📍 {store.location}</p>}
                    {store.address && <p className="truncate">🏠 {store.address}</p>}
                    {store.phone && <p>📞 {store.phone}</p>}
                    {store.ownerId && (
                      <p className="text-blue-600">
                        👤 {users.find((u) => u.id === store.ownerId)?.email || "Owner registered"}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
              {stores.length === 0 && (
                <div className="col-span-3 text-center py-10 text-slate-400">
                  No stores registered yet.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Products Tab ── */}
        {tab === "products" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <h2 className="font-bold text-slate-800 flex-1">
                  All Products ({products.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 w-48"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Arabic Name</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Barcode</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                        <td className="px-5 py-3 text-sm font-medium text-slate-800">{product.name}</td>
                        <td className="px-5 py-3 text-sm text-slate-600" dir="rtl">{product.nameAr}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500 font-mono">{product.barcode || "—"}</td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Subscribers Tab ── */}
        {tab === "subscribers" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-end mb-4">
              <button
                onClick={exportSubscribers}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <h2 className="font-bold text-slate-800 flex-1">
                  Marketing Subscribers ({subscribers.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search subscribers..."
                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 w-48"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((sub) => (
                      <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                        <td className="px-5 py-3 text-sm font-medium text-slate-800">{sub.name || "—"}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{sub.email}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">
                          {sub.createdAt
                            ? format(
                                (sub.createdAt as any).toDate?.() || new Date(sub.createdAt as any),
                                "MMM d, yyyy"
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        {/* ── Claims Tab ── */}
        {tab === "claims" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <StoreClaims stores={stores} users={users} />
          </motion.div>
        )}

        {/* ── Featured Tab ── */}
        {tab === "featured" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">Featured Stores</h2>
                <p className="text-sm text-slate-500">Toggle featured status and set expiry dates for store promotion.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Store</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Featured</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Featured Until</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Label</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store) => (
                      <FeaturedStoreRow
                        key={store.id}
                        store={store}
                        onUpdate={(updated) => setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Revenue Tab ── */}
        {tab === "revenue" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <RevenueTab />
          </motion.div>
        )}

      </div>

      {/* Add Store Modal */}
      <AnimatePresence>
        {showAddStore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddStore(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-800 text-lg">Add New Store</h3>
                <button onClick={() => setShowAddStore(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { key: "name", placeholder: "Store name (English)", required: true },
                  { key: "nameAr", placeholder: "اسم المتجر (عربي)", dir: "rtl" },
                  { key: "location", placeholder: "Location (e.g. Nasr City)" },
                  { key: "address", placeholder: "Full address" },
                  { key: "phone", placeholder: "Phone number" },
                ].map((field) => (
                  <input
                    key={field.key}
                    type="text"
                    placeholder={field.placeholder}
                    value={(newStore as any)[field.key]}
                    onChange={(e) => setNewStore({ ...newStore, [field.key]: e.target.value })}
                    dir={field.dir}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowAddStore(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStore}
                  disabled={addingStore}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {addingStore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Add Store
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
