"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, TrendingDown, Store, Users, Sparkles, ArrowRight, Star, Zap } from "lucide-react";

const POPULAR = ["Panadol", "Rice", "Milk", "Eggs", "Olive Oil", "Sugar", "Nescafé", "Bread"];

const STORES = [
  { name: "Carrefour", emoji: "🛒" },
  { name: "Jumia", emoji: "📦" },
  { name: "Metro", emoji: "🏪" },
  { name: "Hyper One", emoji: "🏢" },
  { name: "Seoudi", emoji: "🥬" },
  { name: "Kheir Zaman", emoji: "🏬" },
  { name: "Amazon EG", emoji: "🛍️" },
];

const STATS = [
  { icon: Store, value: "15+", label: "Stores" },
  { icon: TrendingDown, value: "40%", label: "Avg. Savings" },
  { icon: Users, value: "Free", label: "Always" },
];

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">

      {/* ── Animated Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Pulsing orbs */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-teal-400 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[140px]"
        />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Floating particles */}
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -(24 + (i % 4) * 8), 0], opacity: [0, 0.8, 0] }}
            transition={{
              duration: 3 + (i % 5) * 0.8,
              repeat: Infinity,
              delay: (i % 7) * 0.6,
              ease: "easeInOut",
            }}
            className={`absolute rounded-full ${i % 3 === 0 ? "w-1.5 h-1.5 bg-emerald-400" : i % 3 === 1 ? "w-1 h-1 bg-teal-300" : "w-1 h-1 bg-indigo-400"}`}
            style={{
              left: `${(i * 4.2) % 100}%`,
              top: `${(i * 7.3) % 80 + 10}%`,
            }}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full py-20">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 fill-emerald-400 text-emerald-400" />
          اشتري بدماغك · Shop Smart in Egypt
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.08] mb-5 tracking-tight"
        >
          Find the{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
              Best Price
            </span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full origin-left"
            />
          </span>
          <br />
          <span className="text-slate-300">Across Egypt</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Compare grocery and pharmacy prices across{" "}
          <span className="text-slate-300 font-medium">Carrefour, Metro, Jumia, Hyper One</span>{" "}
          and 10+ more Egyptian stores — in Arabic and English.
        </motion.p>

        {/* Search */}
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in Arabic or English... بحث"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-slate-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:bg-white/15 focus:border-emerald-400/40 transition-all text-sm"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all whitespace-nowrap text-sm"
          >
            <Search className="w-4 h-4" />
            Search Prices
          </motion.button>
        </motion.form>

        {/* Popular tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="flex flex-wrap justify-center gap-2 mb-14"
        >
          <span className="text-slate-600 text-xs self-center font-medium">Popular:</span>
          {POPULAR.map((term, i) => (
            <motion.button
              key={term}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65 + i * 0.05 }}
              whileHover={{ scale: 1.08, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
              className="px-3.5 py-1.5 bg-white/8 border border-white/12 text-slate-400 text-xs rounded-full hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-300 transition-all backdrop-blur-sm"
            >
              {term}
            </motion.button>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-12"
        >
          {STATS.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              whileHover={{ y: -3, scale: 1.04 }}
              className="flex flex-col items-center gap-1.5 bg-white/6 border border-white/10 rounded-2xl py-4 px-2 backdrop-blur-sm cursor-default"
            >
              <Icon className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-extrabold text-xl leading-none">{value}</span>
              <span className="text-slate-500 text-[11px]">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Store strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
        >
          <p className="text-slate-600 text-xs uppercase tracking-widest font-semibold mb-4">
            Prices from
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {STORES.map((store, i) => (
              <motion.div
                key={store.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95 + i * 0.06 }}
                whileHover={{ y: -2 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/6 border border-white/10 rounded-xl text-xs text-slate-400 backdrop-blur-sm cursor-default hover:bg-white/10 transition-all"
              >
                <span className="text-sm">{store.emoji}</span>
                {store.name}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-emerald-500/70 cursor-default"
            >
              <Zap className="w-3 h-3" />
              +8 more
            </motion.div>
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex items-center justify-center gap-3 mt-10"
        >
          <div className="flex -space-x-2">
            {["A", "S", "M", "F", "N"].map((l, i) => (
              <motion.div
                key={l}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1 + i * 0.07, type: "spring" }}
                className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full border-2 border-slate-900 flex items-center justify-center"
              >
                <span className="text-white text-[10px] font-bold">{l}</span>
              </motion.div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-0.5 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-500">Trusted by smart Egyptian shoppers</p>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-5 h-8 border border-slate-600 rounded-full flex items-start justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-2 bg-emerald-400 rounded-full"
          />
        </div>
        <span className="text-slate-700 text-[10px] uppercase tracking-widest">Scroll</span>
      </motion.div>
    </section>
  );
}

