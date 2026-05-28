"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, MapPin, ArrowRight, Heart, Crown, TrendingDown } from "lucide-react";
import { addSubscriber } from "@/lib/firestore";
import toast from "react-hot-toast";

const QUICK_LINKS = [
  { href: "/search", label: "Browse Products" },
  { href: "/search?category=pharmacy", label: "Pharmacy" },
  { href: "/search?category=grains", label: "Grains & Rice" },
  { href: "/search?category=dairy", label: "Dairy & Eggs" },
  { href: "/deals", label: "Today's Deals" },
  { href: "/inflation", label: "Inflation Tracker" },
];

const COMPANY_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/stores", label: "Partner Stores" },
  { href: "/brands/search", label: "Egyptian Brands" },
  { href: "/premium", label: "Premium ✨" },
  { href: "/auth/register", label: "Register Your Store" },
  { href: "/basket", label: "Smart Basket" },
];

const STORES = [
  "Carrefour Egypt", "Jumia Egypt", "Metro Market", "Hyper One",
  "Seoudi Market", "Kheir Zaman", "Spinneys", "Amazon Egypt",
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await addSubscriber(email, name);
      toast.success("Subscribed! You'll receive the best deals weekly.");
      setEmail("");
      setName("");
    } catch {
      toast.error("Failed to subscribe. Try again.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 mt-20 border-t border-slate-800/60">

      {/* Newsletter */}
      <div className="border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-2 mb-2 justify-center lg:justify-start">
                <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-emerald-400 text-sm font-semibold">Weekly Price Drops</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Get the best deals every week</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                Join thousands of Egyptians who save money every week with BKAM price alerts.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:max-w-lg">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm sm:w-32"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm flex-1"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={subscribing}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                {subscribing ? "..." : <>Subscribe <ArrowRight className="w-4 h-4" /></>}
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-sm border border-slate-700">
              <Image src="/Bkam transparent.png" alt="BKAM" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">BKAM</span>
              <span className="text-xs text-emerald-500 block leading-none font-medium mt-0.5">اشتري بدماغك</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-xs">
            Egypt's smartest price comparison platform. Compare groceries, pharmacy, and more across 15+ stores.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Cairo, Egypt 🇪🇬
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              hello@bkam.app
            </div>
          </div>

          {/* Premium badge */}
          <Link href="/premium"
            className="inline-flex items-center gap-2 mt-5 px-3 py-2 bg-amber-500/15 border border-amber-500/25 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-all">
            <Crown className="w-3.5 h-3.5" />
            Upgrade to Premium
          </Link>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Products</h4>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href}
                  className="text-sm text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Company</h4>
          <ul className="space-y-2.5">
            {COMPANY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href}
                  className="text-sm text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Stores */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Partner Stores</h4>
          <ul className="space-y-2.5">
            {STORES.map((store) => (
              <li key={store}>
                <Link href={`/search?store=${encodeURIComponent(store)}`}
                  className="text-sm text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  {store}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800/60 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} BKAM. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in Egypt
          </p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link href="/how-it-works" className="hover:text-slate-400 transition-colors">How It Works</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
