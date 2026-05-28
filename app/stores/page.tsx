"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Phone, Clock, Package, ExternalLink, Search,
  ShieldCheck, Navigation, Loader2, ChevronDown, ChevronUp,
  Globe, AlertCircle, Route,
} from "lucide-react";
import { getAllStores, getPricesForStore, Store } from "@/lib/firestore";
import SponsoredBadge from "@/components/ui/SponsoredBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

/* ─── Static chain metadata ─────────────────────────────────────────────── */
const STORE_METADATA: Record<string, {
  chain: string; color: string; logo: string;
  website?: string; hours?: string; phone?: string;
  locations: { name: string; address: string; lat: number; lng: number }[]
}> = {
  "carrefour": {
    chain: "Carrefour Egypt", color: "#0055A6", logo: "🛒", website: "carrefouregypt.com",
    hours: "9:00 AM – 12:00 AM", phone: "19151",
    locations: [
      { name: "Maadi City Centre", address: "Maadi, Cairo", lat: 29.9602, lng: 31.2569 },
      { name: "City Stars", address: "Heliopolis, Cairo", lat: 30.0711, lng: 31.3453 },
      { name: "Mall of Arabia", address: "6th of October", lat: 29.9713, lng: 30.9393 },
      { name: "Dandy Mega Mall", address: "El Sheikh Zayed", lat: 30.0521, lng: 30.9697 },
    ],
  },
  "metro": {
    chain: "Metro Market", color: "#FF6B00", logo: "🏪", website: "metro-egypt.com",
    hours: "8:00 AM – 11:00 PM",
    locations: [
      { name: "Mohandessin", address: "26 July St, Mohandessin", lat: 30.0589, lng: 31.1994 },
      { name: "Heliopolis", address: "Omar Ibn El Khattab, Heliopolis", lat: 30.0869, lng: 31.3241 },
      { name: "Maadi", address: "Street 9, Maadi", lat: 29.9589, lng: 31.2621 },
    ],
  },
  "seoudi": {
    chain: "Seoudi Market", color: "#00843D", logo: "🥬", website: "seoudionline.com",
    hours: "8:00 AM – 10:00 PM",
    locations: [
      { name: "New Cairo", address: "90th Street, New Cairo", lat: 30.0195, lng: 31.4892 },
      { name: "Zamalek", address: "Hassan Sabri, Zamalek", lat: 30.0619, lng: 31.2217 },
      { name: "Heliopolis", address: "Korba, Heliopolis", lat: 30.0852, lng: 31.3298 },
    ],
  },
  "kheir-zaman": {
    chain: "Kheir Zaman", color: "#E31837", logo: "🏬", website: "kheirzamanonline.com",
    hours: "8:00 AM – 12:00 AM",
    locations: [
      { name: "Nasr City", address: "Abbas El Akkad, Nasr City", lat: 30.0639, lng: 31.3282 },
      { name: "Dokki", address: "Mohi El Din Abu El Izz, Dokki", lat: 30.0382, lng: 31.2133 },
    ],
  },
  "hyper-one": {
    chain: "Hyper One", color: "#8B0000", logo: "🏢", website: "hyperone.com.eg",
    hours: "10:00 AM – 11:00 PM",
    locations: [
      { name: "Sheikh Zayed", address: "Cairo-Alex Desert Rd", lat: 30.0432, lng: 30.9514 },
      { name: "New Cairo", address: "New Cairo", lat: 30.0247, lng: 31.4613 },
    ],
  },
  "spinneys": {
    chain: "Spinneys", color: "#003087", logo: "🛍️", website: "spinneys.com",
    hours: "9:00 AM – 11:00 PM",
    locations: [
      { name: "Zamalek", address: "26 July St, Zamalek", lat: 30.0607, lng: 31.2224 },
      { name: "Maadi", address: "Road 9, Maadi", lat: 29.9611, lng: 31.2584 },
    ],
  },
  "kazyon": {
    chain: "Kazyon", color: "#FF4500", logo: "💰",
    hours: "9:00 AM – 10:00 PM",
    locations: [
      { name: "Shubra", address: "Shubra, Cairo", lat: 30.1189, lng: 31.2353 },
      { name: "Imbaba", address: "Imbaba, Giza", lat: 30.0834, lng: 31.2111 },
    ],
  },
};

/* ─── Type helpers ──────────────────────────────────────────────────────── */
const TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  supermarket:               { label: "Supermarket",    emoji: "🛒", color: "bg-blue-50 text-blue-700"   },
  grocery_or_supermarket:    { label: "Grocery",        emoji: "🥬", color: "bg-green-50 text-green-700" },
  pharmacy:                  { label: "Pharmacy",       emoji: "💊", color: "bg-red-50 text-red-700"     },
  convenience_store:         { label: "Convenience",    emoji: "🏪", color: "bg-slate-100 text-slate-600"},
  bakery:                    { label: "Bakery",         emoji: "🥖", color: "bg-amber-50 text-amber-700" },
  meal_delivery:             { label: "Delivery",       emoji: "🚚", color: "bg-purple-50 text-purple-700"},
  food:                      { label: "Food",           emoji: "🍽️", color: "bg-orange-50 text-orange-700"},
  health:                    { label: "Health",         emoji: "🏥", color: "bg-teal-50 text-teal-700"   },
};

const SKIP_TYPES = new Set(["point_of_interest", "establishment", "store", "food", "health"]);

function getBestType(types: string[]) {
  for (const t of types) {
    if (TYPE_LABELS[t] && !SKIP_TYPES.has(t)) return TYPE_LABELS[t];
  }
  return { label: "Store", emoji: "🏪", color: "bg-slate-100 text-slate-600" };
}

/* ─── Nearby store type ─────────────────────────────────────────────────── */
interface NearbyStore {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  opening_hours: string | null;
  type: string;
  name_ar: string | null;
  lat: number;
  lng: number;
  distance_km: number;
  osm_id: number;
  osm_type: string;
}

interface StoreWithData extends Store { productCount: number; chainKey: string }

/* ─── Nearby Store Card ─────────────────────────────────────────────────── */
function NearbyStoreCard({ store, index }: { store: NearbyStore; index: number }) {
  const [hoursOpen, setHoursOpen] = useState(false);
  const type = getBestType([store.type]);

  const mapsUrl      = `https://www.openstreetmap.org/?mlat=${store.lat}&mlon=${store.lng}#map=17/${store.lat}/${store.lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="p-4">
        {/* Type badge */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${type.color}`}>
            {type.emoji} {type.label}
          </span>
          <span className="shrink-0 text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            {store.distance_km} km
          </span>
        </div>

        {/* Name */}
        <h3 className="font-bold text-slate-800 leading-snug mb-0.5">{store.name}</h3>
        {store.name_ar && (
          <p className="text-[11px] text-slate-400 mb-2" dir="rtl">{store.name_ar}</p>
        )}

        {/* Details */}
        <div className="space-y-1.5 text-[12px] text-slate-500 mb-3">
          {store.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
              <span className="leading-snug">{store.address}</span>
            </div>
          )}
          {store.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <a href={`tel:${store.phone}`} className="hover:text-emerald-600 transition-colors font-medium">
                {store.phone}
              </a>
            </div>
          )}
          {store.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <a
                href={store.website.startsWith("http") ? store.website : `https://${store.website}`}
                target="_blank" rel="noopener noreferrer"
                className="hover:text-emerald-600 transition-colors truncate max-w-[160px] font-medium"
              >
                {store.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            </div>
          )}
        </div>

        {/* Opening hours toggle */}
        {store.opening_hours && (
          <div className="mb-3">
            <button
              onClick={() => setHoursOpen(v => !v)}
              className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-emerald-600 transition-colors font-medium"
            >
              <Clock className="w-3.5 h-3.5" />
              Opening Hours
              {hoursOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {hoursOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                    {store.opening_hours}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <a
            href={directionsUrl}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-bold rounded-xl transition-colors"
          >
            <Route className="w-3.5 h-3.5" /> Directions
          </a>
          <a
            href={mapsUrl}
            target="_blank" rel="noopener noreferrer"
            title="View on OpenStreetMap"
            className="flex items-center justify-center gap-1 px-3 py-2 border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 text-[12px] font-medium rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function StoresPage() {
  // Firebase stores
  const [stores,        setStores]        = useState<StoreWithData[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreWithData | null>(null);

  // Nearby stores
  const [nearbyStores,  setNearbyStores]  = useState<NearbyStore[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError,   setNearbyError]   = useState<string | null>(null);
  const [userLocation,  setUserLocation]  = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyFilter,  setNearbyFilter]  = useState<string>("all");
  const [nearbyRadius,  setNearbyRadius]  = useState<number>(3000);

  /* Load Firebase stores */
  useEffect(() => {
    async function load() {
      const storeList = await getAllStores();
      const enriched = await Promise.all(
        storeList.map(async (s) => {
          const prices = await getPricesForStore(s.id);
          const chainKey = Object.keys(STORE_METADATA).find((k) =>
            s.name.toLowerCase().includes(k.replace("-", " ").toLowerCase()) ||
            k.replace("-", " ").toLowerCase().includes(s.name.toLowerCase().split(" ")[0].toLowerCase())
          ) || "";
          return { ...s, productCount: prices.length, chainKey };
        })
      );
      const sorted = [...enriched].sort((a, b) => {
        const nowT = new Date();
        const aF = a.featured === true && (!a.featuredUntil || (a.featuredUntil as any).toDate?.() > nowT);
        const bF = b.featured === true && (!b.featuredUntil || (b.featuredUntil as any).toDate?.() > nowT);
        if (aF && !bF) return -1;
        if (!aF && bF) return 1;
        return 0;
      });
      setStores(sorted);
      setLoadingStores(false);
    }
    load();
  }, []);

  /* Fetch nearby stores from Google Places */
  const fetchNearby = useCallback(async (lat: number, lng: number, radius: number) => {
    setNearbyLoading(true);
    setNearbyError(null);
    try {
      const res = await fetch(`/api/nearby-stores?lat=${lat}&lng=${lng}&radius=${radius}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch nearby stores");
      setNearbyStores(data.stores || []);
    } catch (e: any) {
      setNearbyError(e.message || "Something went wrong");
    } finally {
      setNearbyLoading(false);
    }
  }, []);

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      setNearbyError("Geolocation is not supported by your browser.");
      return;
    }
    setNearbyLoading(true);
    setNearbyError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        fetchNearby(lat, lng, nearbyRadius);
      },
      (err) => {
        setNearbyLoading(false);
        setNearbyError(
          err.code === 1
            ? "Location access denied. Please allow location permission in your browser."
            : "Could not get your location. Please try again."
        );
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleRadiusChange = (r: number) => {
    setNearbyRadius(r);
    if (userLocation) fetchNearby(userLocation.lat, userLocation.lng, r);
  };

  /* Filter nearby by type */
  const filteredNearby = nearbyFilter === "all"
    ? nearbyStores
    : nearbyStores.filter(s => s.type === nearbyFilter);

  const meta = (s: StoreWithData) => STORE_METADATA[s.chainKey];
  const filtered = stores.filter((s) =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── JSX ──────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-emerald-500" />
            Stores Near You
          </h1>
          <p className="text-slate-500 mt-1">Find supermarkets, pharmacies, and shops near your location</p>
        </motion.div>

        {/* ══ NEAREST SHOPS SECTION ══════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 mb-6 text-white shadow-lg shadow-emerald-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold mb-1 flex items-center gap-2">
                  <Navigation className="w-5 h-5" /> Nearest Shops & Markets
                </h2>
                <p className="text-emerald-100 text-sm">
                  {userLocation
                    ? `Showing stores within ${nearbyRadius >= 1000 ? `${nearbyRadius / 1000} km` : `${nearbyRadius} m`} of your location`
                    : "Allow location access to discover supermarkets, pharmacies & shops near you"}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFindNearMe}
                disabled={nearbyLoading}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-bold rounded-2xl text-sm hover:shadow-md transition-all disabled:opacity-70"
              >
                {nearbyLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
                  : <><Navigation className="w-4 h-4" /> {userLocation ? "Refresh" : "Find Near Me"}</>
                }
              </motion.button>
            </div>

            {/* Radius selector */}
            {userLocation && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-emerald-100 text-xs font-semibold">Radius:</span>
                {[500, 1000, 2000, 3000, 5000].map(r => (
                  <button
                    key={r}
                    onClick={() => handleRadiusChange(r)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      nearbyRadius === r
                        ? "bg-white text-emerald-700"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {r >= 1000 ? `${r / 1000} km` : `${r} m`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {nearbyError && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-4 text-sm text-red-700"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Could not load nearby stores</p>
                <p className="text-red-500 mt-0.5">{nearbyError}</p>
              </div>
            </motion.div>
          )}

          {/* Loading skeleton */}
          {nearbyLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
                  <div className="h-32 bg-slate-100 rounded-xl mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-full mb-1" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!nearbyLoading && nearbyStores.length > 0 && (
            <>
              {/* Filter tabs */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { key: "all",                    label: "All",           emoji: "🗺️" },
                  { key: "supermarket",             label: "Supermarkets",  emoji: "🛒" },
                  { key: "grocery_or_supermarket",  label: "Grocery",       emoji: "🥬" },
                  { key: "pharmacy",                label: "Pharmacy",      emoji: "💊" },
                  { key: "convenience_store",       label: "Convenience",   emoji: "🏪" },
                  { key: "bakery",                  label: "Bakery",        emoji: "🥖" },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setNearbyFilter(tab.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      nearbyFilter === tab.key
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                  >
                    <span>{tab.emoji}</span> {tab.label}
                    {tab.key === "all" && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-0.5 ${
                        nearbyFilter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {nearbyStores.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Map embed centered on user — free OpenStreetMap */}
              {userLocation && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 mb-4 shadow-sm" style={{ height: 240 }}>
                  <iframe
                    title="Nearby Stores Map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.03},${userLocation.lat - 0.02},${userLocation.lng + 0.03},${userLocation.lat + 0.02}&layer=mapnik&marker=${userLocation.lat},${userLocation.lng}`}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              )}

              <p className="text-sm text-slate-500 mb-4">
                Found <span className="font-bold text-slate-700">{filteredNearby.length}</span> stores near you
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredNearby.map((store, i) => (
                  <NearbyStoreCard key={store.id} store={store} index={i} />
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {!nearbyLoading && !nearbyError && nearbyStores.length === 0 && !userLocation && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <div className="text-5xl mb-3">📍</div>
              <p className="font-semibold text-slate-700 mb-1">Tap "Find Near Me" to get started</p>
              <p className="text-sm text-slate-400">We'll find supermarkets, pharmacies & shops near your location</p>
            </div>
          )}
        </motion.div>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">BKAM Partner Stores</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* ── Search bar ──────────────────────────────────────────────── */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search partner stores by name or location..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
          />
        </div>

        {/* ── Firebase stores grid ────────────────────────────────────── */}
        {loadingStores ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Loading stores..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((store, i) => {
              const m = meta(store);
              return (
                <motion.div key={store.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedStore(selectedStore?.id === store.id ? null : store)}
                  className={`bg-white rounded-2xl border cursor-pointer transition-all ${
                    selectedStore?.id === store.id ? "border-emerald-400 shadow-md" : "border-slate-100 hover:border-slate-200 hover:shadow-sm"
                  }`}
                >
                  <div className="p-5">
                    {(() => {
                      const nowT = new Date();
                      const isFeatured = store.featured === true && (
                        !store.featuredUntil || (store.featuredUntil as any).toDate?.() > nowT
                      );
                      return isFeatured ? <div className="mb-2"><SponsoredBadge label={store.featuredLabel || "Sponsored"} /></div> : null;
                    })()}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: (m?.color || "#64748b") + "20" }}>
                          {m?.logo || "🏪"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-800">{store.name}</h3>
                            {store.verified && (
                              <span title="Verified Store"><ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /></span>
                            )}
                          </div>
                          {store.nameAr && <p className="text-xs text-slate-400" dir="rtl">{store.nameAr}</p>}
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
                        {store.productCount} products
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm text-slate-500">
                      {store.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{store.location}</span>
                        </div>
                      )}
                      {m?.hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{m.hours}</span>
                        </div>
                      )}
                      {(m?.phone || store.phone) && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{m?.phone || store.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      {m?.website && (
                        <a href={`https://${m.website}`} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                          <ExternalLink className="w-3 h-3" /> Website
                        </a>
                      )}
                      <Link href={`/search?store=${encodeURIComponent(store.name)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium ml-auto">
                        <Package className="w-3 h-3" /> View prices
                      </Link>
                    </div>
                    {!store.claimedBy && (
                      <div className="mt-2 pt-2 border-t border-slate-50">
                        <Link href={`/claim-store/${store.id}`} onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-600 hover:text-blue-700">
                          Claim store →
                        </Link>
                      </div>
                    )}
                  </div>

                  {selectedStore?.id === store.id && m?.locations && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }}
                      className="border-t border-slate-100 overflow-hidden">
                      <div className="p-4 space-y-2">
                        <p className="text-xs font-semibold text-slate-500 mb-2">BRANCHES</p>
                        {m.locations.map((loc) => (
                          <a key={loc.name}
                            href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-start gap-2 text-sm text-slate-600 hover:text-emerald-700 py-1 group"
                          >
                            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 group-hover:text-emerald-500" />
                            <div>
                              <p className="font-medium">{loc.name}</p>
                              <p className="text-xs text-slate-400">{loc.address}</p>
                            </div>
                            <ExternalLink className="w-3 h-3 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── All major chains ─────────────────────────────────────────── */}
        <div className="mt-10">
          <h2 className="font-bold text-slate-700 mb-4 text-lg">All Major Egyptian Store Chains</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(STORE_METADATA).map(([key, m]) => (
              <div key={key} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: m.color + "20" }}>
                  {m.logo}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{m.chain}</p>
                  <p className="text-xs text-slate-400">{m.locations.length} branches</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
