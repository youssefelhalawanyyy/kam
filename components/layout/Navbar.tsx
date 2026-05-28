"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Menu, X, LogOut, LayoutDashboard, Shield,
  Heart, ShoppingBasket, Zap, ScanLine, Crown,
  ChevronDown, Home, Package, Store, TrendingUp,
  Pill, Wheat, Flame, UtensilsCrossed, Layers, Shirt,
  Dumbbell, Baby, Gem, Sparkles, Milk, TrendingDown, Grid3X3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import NotificationBell from "@/components/ui/NotificationBell";

/* ─── static data ──────────────────────────────────────────────────────── */
const PRODUCT_CATS = [
  { href: "/search?category=pharmacy",  label: "Pharmacy",     ar: "صيدلية",       Icon: Pill,            c: "#3b82f6", bg: "#eff6ff" },
  { href: "/search?category=dairy",     label: "Dairy & Eggs", ar: "ألبان وبيض",    Icon: Milk,            c: "#f59e0b", bg: "#fffbeb" },
  { href: "/search?category=grains",    label: "Grains & Rice",ar: "حبوب وأرز",     Icon: Wheat,           c: "#f97316", bg: "#fff7ed" },
  { href: "/search?category=oils",      label: "Oils",         ar: "زيوت",          Icon: Flame,           c: "#10b981", bg: "#f0fdf4" },
  { href: "/search?category=pantry",    label: "Pantry",       ar: "مؤونة",         Icon: UtensilsCrossed, c: "#8b5cf6", bg: "#f5f3ff" },
  { href: "/search?category=canned",    label: "Canned Goods", ar: "معلبات",        Icon: Layers,          c: "#ef4444", bg: "#fef2f2" },
];

const BRAND_CATS = [
  { href: "/brands/search?cat=streetwear",  label: "Streetwear",  Icon: Shirt,    c: "#64748b", bg: "#f8fafc" },
  { href: "/brands/search?cat=sports",      label: "Sports",      Icon: Dumbbell, c: "#2563eb", bg: "#eff6ff" },
  { href: "/brands/search?cat=women",       label: "Women",       Icon: Sparkles, c: "#db2777", bg: "#fdf2f8" },
  { href: "/brands/search?cat=kids",        label: "Kids",        Icon: Baby,     c: "#ec4899", bg: "#fdf2f8" },
  { href: "/brands/search?cat=accessories", label: "Accessories", Icon: Gem,      c: "#d97706", bg: "#fffbeb" },
  { href: "/brands/search?cat=luxury",      label: "Luxury",      Icon: Crown,    c: "#7c3aed", bg: "#f5f3ff" },
];

const HOT_DEALS = [
  { href: "/deals/flash",    label: "Flash Sale",     badge: "LIVE",  badgeColor: "#ef4444" },
  { href: "/deals/weekly",   label: "Weekly Picks",   badge: "NEW",   badgeColor: "#10b981" },
  { href: "/deals/clearance",label: "Clearance",      badge: "50%+",  badgeColor: "#f59e0b" },
];

const POPULAR = ["Rice", "Panadol", "Milk", "Cooking Oil", "Sugar", "Nescafé", "Eggs", "Bread"];

/* ─── navbar ────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const { user, profile, logout, isAdmin, isStore } = useAuth();
  const { count: wCount } = useWishlist();
  const { lang, setLang } = useLanguage();
  const router   = useRouter();
  const pathname = usePathname();

  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [userOpen,      setUserOpen]      = useState(false);
  const [catOpen,       setCatOpen]       = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [query,         setQuery]         = useState("");
  const [scrolled,      setScrolled]      = useState(false);
  const [activeTab,     setActiveTab]     = useState<"products" | "deals" | "brands">("products");

  const searchRef = useRef<HTMLInputElement>(null);
  const catTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* keyboard */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); setMobileOpen(false); setUserOpen(false); setCatOpen(false); }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  useEffect(() => { if (searchOpen) setTimeout(() => searchRef.current?.focus(), 60); }, [searchOpen]);

  useEffect(() => {
    setMobileOpen(false); setUserOpen(false); setSearchOpen(false); setCatOpen(false);
  }, [pathname]);

  const openCat  = () => { if (catTimer.current) clearTimeout(catTimer.current); setCatOpen(true); };
  const closeCat = () => { catTimer.current = setTimeout(() => setCatOpen(false), 150); };

  const go = (term: string) => {
    const t = (term || query).trim();
    if (!t) return;
    router.push(`/search?q=${encodeURIComponent(t)}`);
    setSearchOpen(false); setQuery("");
  };

  const userInitial = (profile?.name || user?.email || "U")[0].toUpperCase();
  const catActive   = pathname.startsWith("/search") || pathname.startsWith("/brands") || pathname.startsWith("/deals");

  /* ── JSX ─────────────────────────────────────────────────────────────── */
  return (
    <>
    {/* ████ NAV BAR ████████████████████████████████████████████████████████ */}
    <motion.nav
      initial={{ y: -72 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/98 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.05)]"
          : "bg-white/80 backdrop-blur-xl"
      }`}
    >
      {/* top accent line */}
      <div className="h-[2.5px] bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-[58px] gap-2">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0 mr-3 select-none">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -5 }}
              transition={{ type: "spring", stiffness: 380, damping: 16 }}
              className="w-[34px] h-[34px] bg-white rounded-[10px] border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden"
            >
              <Image src="/Bkam transparent.png" alt="BKAM" width={34} height={34} className="object-contain" priority />
            </motion.div>
            <div className="hidden sm:block leading-none">
              <span className="font-black text-[17px] tracking-tight text-slate-900">BKAM</span>
              <span className="text-[8.5px] text-emerald-600 block font-black mt-[2px] tracking-[0.15em] uppercase">اشتري بدماغك</span>
            </div>
          </Link>

          {/* ── Desktop nav ──────────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">

            <NavLink href="/" active={pathname === "/"} Icon={Home}>Home</NavLink>

            {/* ── Categories dropdown ───────────────────────────────── */}
            <div className="relative" onMouseEnter={openCat} onMouseLeave={closeCat}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setCatOpen(v => !v)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all select-none ${
                  catActive || catOpen
                    ? "bg-emerald-50 text-emerald-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Grid3X3 className="w-[13px] h-[13px] shrink-0" />
                Categories
                <motion.div
                  animate={{ rotate: catOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ChevronDown className="w-3.5 h-3.5 text-current opacity-60" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    key="mega-menu"
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{    opacity: 0, y: 8,   scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={openCat} onMouseLeave={closeCat}
                    className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+14px)] w-[620px] bg-white rounded-[20px] border border-slate-200/60 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.18)] overflow-hidden"
                  >
                    {/* Tab bar */}
                    <div className="flex items-center gap-1 px-4 pt-4 pb-0">
                      {([
                        { id: "products", label: "🛒 Products" },
                        { id: "deals",    label: "⚡ Deals" },
                        { id: "brands",   label: "🇪🇬 Egypt Brands" },
                      ] as const).map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`relative px-4 py-2 text-[12.5px] font-semibold rounded-xl transition-all ${
                            activeTab === tab.id
                              ? "text-emerald-700 bg-emerald-50"
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {tab.label}
                          {activeTab === tab.id && (
                            <motion.div
                              layoutId="tab-indicator"
                              className="absolute bottom-0 left-3 right-3 h-[2px] bg-emerald-500 rounded-full"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                        </button>
                      ))}
                      <div className="ml-auto pr-1">
                        <Link
                          href={activeTab === "products" ? "/search" : activeTab === "deals" ? "/deals" : "/brands/search"}
                          className="text-[11.5px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          Browse all →
                        </Link>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 mx-4 mt-3" />

                    {/* Panel content */}
                    <div className="p-4">
                      <AnimatePresence mode="wait">
                        {activeTab === "products" && (
                          <motion.div
                            key="panel-products"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{    opacity: 0, y: -6 }}
                            transition={{ duration: 0.16 }}
                            className="grid grid-cols-3 gap-1.5"
                          >
                            {PRODUCT_CATS.map((cat, i) => (
                              <motion.div
                                key={cat.href}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                              >
                                <Link href={cat.href}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group/item">
                                  <span
                                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110"
                                    style={{ backgroundColor: cat.bg }}
                                  >
                                    <cat.Icon className="w-4 h-4" style={{ color: cat.c }} />
                                  </span>
                                  <div>
                                    <p className="text-[13px] font-semibold text-slate-800 leading-tight">{cat.label}</p>
                                    <p className="text-[10.5px] text-slate-400 mt-[1px]" dir="rtl">{cat.ar}</p>
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}

                        {activeTab === "deals" && (
                          <motion.div
                            key="panel-deals"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{    opacity: 0, y: -6 }}
                            transition={{ duration: 0.16 }}
                          >
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              {HOT_DEALS.map((d, i) => (
                                <motion.div
                                  key={d.href}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.04, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                >
                                  <Link href={d.href}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-white transition-all group/deal">
                                    <span
                                      className="text-[10px] font-black tracking-wide px-2.5 py-1 rounded-full text-white"
                                      style={{ backgroundColor: d.badgeColor }}
                                    >{d.badge}</span>
                                    <p className="text-[13px] font-semibold text-slate-700 group-hover/deal:text-emerald-700 transition-colors">{d.label}</p>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                              <div>
                                <p className="text-[12px] font-bold text-amber-800">Premium deals</p>
                                <p className="text-[11px] text-amber-600">Unlock exclusive discounts up to 60% off</p>
                              </div>
                              <Link href="/premium"
                                className="ml-auto px-3 py-1.5 text-[11.5px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shrink-0">
                                Upgrade
                              </Link>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === "brands" && (
                          <motion.div
                            key="panel-brands"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{    opacity: 0, y: -6 }}
                            transition={{ duration: 0.16 }}
                            className="grid grid-cols-3 gap-1.5"
                          >
                            {BRAND_CATS.map((cat, i) => (
                              <motion.div
                                key={cat.href}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                              >
                                <Link href={cat.href}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group/item">
                                  <span
                                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110"
                                    style={{ backgroundColor: cat.bg }}
                                  >
                                    <cat.Icon className="w-4 h-4" style={{ color: cat.c }} />
                                  </span>
                                  <p className="text-[13px] font-semibold text-slate-800">{cat.label}</p>
                                </Link>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Footer strip */}
                    <div className="flex items-center gap-4 px-5 py-3 bg-gradient-to-r from-slate-50 to-slate-50/50 border-t border-slate-100">
                      {[
                        { href: "/search",   Icon: Package,        label: "All Products" },
                        { href: "/basket",   Icon: ShoppingBasket, label: "Smart Basket" },
                        { href: "/stores",   Icon: Store,          label: "Stores" },
                        { href: "/inflation",Icon: TrendingUp,     label: "Inflation" },
                      ].map(({ href, Icon: I, label }) => (
                        <Link key={href} href={href}
                          className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-emerald-600 transition-colors">
                          <I className="w-3.5 h-3.5" />{label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stores & Inflation */}
            <NavLink href="/stores"    active={pathname === "/stores"}    Icon={Store}>Stores</NavLink>
            <NavLink href="/inflation" active={pathname === "/inflation"} Icon={TrendingUp}>Inflation</NavLink>
          </div>

          {/* ── Right actions ────────────────────────────────────────── */}
          <div className="flex items-center gap-0.5 ml-auto">

            {/* search */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 pl-3 pr-2.5 py-[7px] rounded-xl bg-slate-100/90 hover:bg-slate-200/60 border border-transparent hover:border-slate-200/50 text-slate-500 hover:text-slate-700 transition-all group"
            >
              <Search className="w-[15px] h-[15px] shrink-0" />
              <span className="hidden md:flex items-center gap-2 text-[12px] text-slate-400 group-hover:text-slate-500 transition-colors">
                Search...
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[9px] font-mono text-slate-300">⌘K</kbd>
              </span>
            </motion.button>

            <div className="w-px h-4 bg-slate-200/60 mx-1 hidden md:block" />

            {/* language */}
            <ActionBtn onClick={() => setLang(lang === "en" ? "ar" : "en")} title="Language" className="hidden sm:flex">
              <span className="text-[11px] font-black text-slate-600">{lang === "en" ? "ع" : "EN"}</span>
            </ActionBtn>

            <NotificationBell />

            {/* scan */}
            <ActionBtn as={Link} href="/scan" title="Scan barcode" className="hidden sm:flex">
              <ScanLine className="w-[15px] h-[15px]" />
            </ActionBtn>

            {/* wishlist */}
            <ActionBtn as={Link} href="/wishlist" title="Wishlist" hover="rose">
              <Heart className="w-[15px] h-[15px]" />
              <AnimatePresence>
                {wCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-[3px] bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none shadow-sm"
                  >{wCount > 9 ? "9+" : wCount}</motion.span>
                )}
              </AnimatePresence>
            </ActionBtn>

            {/* basket */}
            <ActionBtn as={Link} href="/basket" title="Basket" hover="emerald" className="hidden sm:flex">
              <ShoppingBasket className="w-[15px] h-[15px]" />
            </ActionBtn>

            <div className="w-px h-4 bg-slate-200/60 mx-1 hidden lg:block" />

            {/* premium */}
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
              <Link href="/premium"
                className="flex items-center gap-1.5 px-3.5 py-[7px] bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[12.5px] font-bold rounded-xl shadow-[0_2px_10px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_16px_rgba(245,158,11,0.4)] transition-shadow select-none">
                <Crown className="w-3.5 h-3.5" />Premium
              </Link>
            </motion.div>

            {/* user */}
            {user ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setUserOpen(v => !v)}
                  className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl transition-all hover:bg-slate-100/80 ${userOpen ? "bg-slate-100/80" : ""}`}
                >
                  <div className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm shrink-0">
                    <span className="text-white text-[11px] font-black">{userInitial}</span>
                  </div>
                  <span className="hidden xl:block text-[13px] font-medium text-slate-700 max-w-[80px] truncate">
                    {profile?.name?.split(" ")[0] || user.email?.split("@")[0]}
                  </span>
                  <motion.div animate={{ rotate: userOpen ? 180 : 0 }} transition={{ duration: 0.22 }}>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      key="user-dropdown"
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1 }}
                      exit={{    opacity: 0, y: 6,   scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-[calc(100%+12px)] w-[220px] bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.16)] border border-slate-200/70 overflow-hidden"
                    >
                      <div className="px-4 py-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm shrink-0">
                          <span className="text-white text-sm font-black">{userInitial}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-800 truncate">
                            {profile?.name || user.email?.split("@")[0]}
                          </p>
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold mt-0.5 ${
                            isAdmin ? "bg-purple-100 text-purple-700" :
                            isStore ? "bg-blue-100 text-blue-700" :
                            "bg-emerald-100 text-emerald-700"
                          }`}>
                            {isAdmin ? "Admin" : isStore ? "Store" : "Free"}
                          </span>
                        </div>
                      </div>

                      <div className="p-2 space-y-0.5">
                        {isAdmin && <DropItem href="/admin" color="purple" Icon={Shield}>Admin Panel</DropItem>}
                        {(isStore || isAdmin) && <DropItem href="/dashboard" color="blue" Icon={LayoutDashboard}>Dashboard</DropItem>}
                        <DropItem href="/wishlist" color="rose" Icon={Heart}>Wishlist</DropItem>
                        <DropItem href="/basket" color="emerald" Icon={ShoppingBasket}>Smart Basket</DropItem>
                        <DropItem href="/premium" color="amber" Icon={Crown} bold>Upgrade to Premium</DropItem>
                        <div className="my-1 h-px bg-slate-100" />
                        <button
                          onClick={() => { logout(); router.push("/"); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1 ml-1">
                <Link href="/auth/login"
                  className="px-3 py-[7px] text-[13px] font-medium text-slate-600 hover:text-emerald-700 rounded-xl hover:bg-emerald-50/80 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/register"
                  className="px-3.5 py-[7px] text-[13px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-shadow">
                  Sign Up
                </Link>
              </div>
            )}

            {/* hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden ml-1.5 w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100/80 transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileOpen ? "x" : "m"}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.18 }}
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden border-t border-slate-100/80 bg-white/98 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3 max-h-[82vh] overflow-y-auto overscroll-contain">
              {/* search */}
              <button
                onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-100/80 rounded-2xl text-[13px] text-slate-500 hover:bg-slate-200/60 transition-colors text-left"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>Search products... <span className="text-slate-400">بحث</span></span>
                <kbd className="ml-auto px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono text-slate-300 shrink-0">⌘K</kbd>
              </button>

              {/* links */}
              <div className="space-y-0.5">
                <MobileLink href="/" active={pathname === "/"} Icon={Home}>Home</MobileLink>

                {/* categories accordion */}
                <div>
                  <button
                    onClick={() => setMobileCatOpen(v => !v)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ${
                      catActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4 text-slate-400 shrink-0" />
                    Categories
                    <motion.div animate={{ rotate: mobileCatOpen ? 180 : 0 }} transition={{ duration: 0.22 }} className="ml-auto">
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {mobileCatOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 mt-2 pl-3 border-l-2 border-emerald-100 pb-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] px-2 py-2">Products</p>
                          {PRODUCT_CATS.map(cat => (
                            <Link key={cat.href} href={cat.href}
                              className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] text-slate-600 hover:bg-slate-50 transition-colors">
                              <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat.bg }}>
                                <cat.Icon className="w-3 h-3" style={{ color: cat.c }} />
                              </span>
                              <span className="font-medium">{cat.label}</span>
                              <span className="text-slate-400 text-[11px] ml-auto" dir="rtl">{cat.ar}</span>
                            </Link>
                          ))}

                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] px-2 pt-3 pb-2 flex items-center gap-1">
                            <span>⚡</span> Deals
                          </p>
                          {HOT_DEALS.map(d => (
                            <Link key={d.href} href={d.href}
                              className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] text-slate-600 hover:bg-slate-50 transition-colors">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: d.badgeColor }}>{d.badge}</span>
                              <span className="font-medium">{d.label}</span>
                            </Link>
                          ))}

                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] px-2 pt-3 pb-2 flex items-center gap-1">
                            <span>🇪🇬</span> Egyptian Brands
                          </p>
                          {BRAND_CATS.map(cat => (
                            <Link key={cat.href} href={cat.href}
                              className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] text-slate-600 hover:bg-slate-50 transition-colors">
                              <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat.bg }}>
                                <cat.Icon className="w-3 h-3" style={{ color: cat.c }} />
                              </span>
                              <span className="font-medium">{cat.label}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <MobileLink href="/stores"    active={pathname==="/stores"}    Icon={Store}>Stores</MobileLink>
                <MobileLink href="/inflation" active={pathname==="/inflation"} Icon={TrendingUp}>Inflation</MobileLink>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/scan",     label: "Scan Barcode",                               Icon: ScanLine,       cls: "text-slate-500" },
                  { href: "/wishlist", label: `Wishlist${wCount > 0 ? ` (${wCount})` : ""}`,Icon: Heart,          cls: "text-rose-500"  },
                  { href: "/basket",   label: "Smart Basket",                               Icon: ShoppingBasket, cls: "text-emerald-600"},
                ].map(it => (
                  <Link key={it.href} href={it.href}
                    className="flex items-center gap-2.5 px-4 py-3 bg-slate-50/80 border border-slate-100 rounded-xl text-[13px] text-slate-600 font-medium hover:bg-white hover:border-slate-200 transition-all">
                    <it.Icon className={`w-4 h-4 ${it.cls} shrink-0`} />
                    <span className="truncate">{it.label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => setLang(lang === "en" ? "ar" : "en")}
                  className="flex items-center gap-2.5 px-4 py-3 bg-slate-50/80 border border-slate-100 rounded-xl text-[13px] text-slate-600 font-medium hover:bg-white hover:border-slate-200 transition-all"
                >
                  🌐 {lang === "en" ? "عربي" : "English"}
                </button>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Link href="/premium"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl text-[13.5px] shadow-[0_4px_16px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_24px_rgba(245,158,11,0.4)] transition-shadow">
                  <Crown className="w-4 h-4" /> Upgrade to Premium
                </Link>
              </motion.div>

              {user ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/80 border border-slate-100 rounded-2xl">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-black">{userInitial}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">{profile?.name || user.email?.split("@")[0]}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button onClick={() => { logout(); router.push("/"); }} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/auth/login" className="flex-1 py-3 text-center text-[13.5px] font-semibold text-emerald-700 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="flex-1 py-3 text-center text-[13.5px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl hover:shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-shadow">
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>

    {/* ████ SEARCH OVERLAY ████████████████████████████████████████████████ */}
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[8px]"
          onClick={() => setSearchOpen(false)}
        >
          <div className="max-w-[640px] mx-auto px-4 pt-20">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[22px] shadow-[0_36px_100px_-16px_rgba(0,0,0,0.28)] border border-slate-200/80 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <form
                onSubmit={e => { e.preventDefault(); go(query); }}
                className="flex items-center gap-3 px-5 py-4 border-b border-slate-100"
              >
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="flex-1 text-[15px] text-slate-800 placeholder-slate-400 outline-none bg-transparent"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")}
                    className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors shrink-0">
                    <X className="w-3 h-3 text-slate-500" />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-400 shrink-0">ESC</kbd>
              </form>

              <div className="p-5">
                <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-[0.12em] mb-3">Popular Searches</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {POPULAR.map(term => (
                    <motion.button key={term} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      onClick={() => go(term)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[13px] rounded-xl transition-colors border border-transparent hover:border-emerald-200">
                      <TrendingDown className="w-3.5 h-3.5 text-slate-400" />{term}
                    </motion.button>
                  ))}
                </div>

                <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-[0.12em] mb-3">Categories</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                  {PRODUCT_CATS.map(cat => (
                    <Link key={cat.href} href={cat.href} onClick={() => setSearchOpen(false)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:opacity-90 active:scale-95 transition-all text-center cursor-pointer"
                      style={{ backgroundColor: cat.bg }}>
                      <cat.Icon className="w-4 h-4" style={{ color: cat.c }} />
                      <span className="text-[11px] text-slate-700 font-semibold leading-tight">{cat.label.split(" ")[0]}</span>
                    </Link>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <Link href="/search" onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-1.5 text-[13px] text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                    <Package className="w-3.5 h-3.5" /> All products →
                  </Link>
                  <Link href="/brands/search" onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-1.5 text-[13px] text-slate-500 font-medium hover:text-slate-700 transition-colors">
                    🇪🇬 Egyptian brands →
                  </Link>
                  <Link href="/deals" onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-1.5 text-[13px] text-amber-600 font-medium hover:text-amber-700 transition-colors ml-auto">
                    <Zap className="w-3.5 h-3.5" /> Deals →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

/* ─── sub-components ─────────────────────────────────────────────────────── */
function NavLink({ href, active, Icon, accent = false, children }: {
  href: string; active: boolean; Icon: React.ElementType; accent?: boolean; children: React.ReactNode;
}) {
  return (
    <Link href={href}
      className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all select-none ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : accent
          ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50/70"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
      }`}
    >
      <Icon className={`w-[13px] h-[13px] shrink-0 ${accent ? "text-amber-500" : ""}`} />
      {children}
      {active && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-xl bg-emerald-50 -z-10"
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        />
      )}
    </Link>
  );
}

function MobileLink({ href, active, Icon, accent = false, children }: {
  href: string; active: boolean; Icon: React.ElementType; accent?: boolean; children: React.ReactNode;
}) {
  return (
    <Link href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
        active ? "bg-emerald-50 text-emerald-700" :
        accent ? "text-amber-600 hover:bg-amber-50/60" :
        "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${accent ? "text-amber-500" : "text-slate-400"}`} />
      {children}
      {active && <span className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
    </Link>
  );
}

function ActionBtn({ as: Tag = "button", children, hover, className = "", ...props }: {
  as?: React.ElementType; children: React.ReactNode; hover?: "rose" | "emerald";
  className?: string; [k: string]: unknown;
}) {
  const hoverCls = hover === "rose"    ? "hover:text-rose-500 hover:bg-rose-50/80" :
                   hover === "emerald" ? "hover:text-emerald-600 hover:bg-emerald-50/80" :
                   "hover:text-slate-700 hover:bg-slate-100/80";
  return (
    <Tag {...props}
      className={`relative w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 transition-all ${hoverCls} ${className}`}
    >
      {children}
    </Tag>
  );
}

function DropItem({ href, Icon, color, bold = false, children }: {
  href: string; Icon: React.ElementType; color: string; bold?: boolean; children: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    purple:  "hover:bg-purple-50 hover:text-purple-700",
    blue:    "hover:bg-blue-50 hover:text-blue-700",
    rose:    "hover:bg-rose-50 hover:text-rose-600",
    emerald: "hover:bg-emerald-50 hover:text-emerald-700",
    amber:   "hover:bg-amber-50 text-amber-700",
  };
  return (
    <Link href={href}
      className={`flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-600 rounded-xl transition-colors ${colorMap[color] ?? ""} ${bold ? "font-semibold" : ""}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />{children}
    </Link>
  );
}