"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap, Bell, BarChart2, Search, ShieldCheck, Clock, Heart,
  Star, Check, X, Crown, Sparkles, TrendingDown, Mail,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const FREE_FEATURES = [
  "Search & compare prices",
  "View price history (30 days)",
  "3 active price alerts",
  "Wishlist (10 items)",
  "Basic inflation tracker",
  "Add to shopping basket",
];

const PREMIUM_FEATURES = [
  { icon: <Bell className="w-4 h-4" />, label: "Unlimited price alerts", desc: "Never miss a deal — unlimited alerts across all products" },
  { icon: <Clock className="w-4 h-4" />, label: "Hourly price checks", desc: "Alerts fire within 1 hour of a price drop (vs 24h for free)" },
  { icon: <BarChart2 className="w-4 h-4" />, label: "Full price history (1 year)", desc: "See 12 months of price trends per product" },
  { icon: <TrendingDown className="w-4 h-4" />, label: "Price drop predictions", desc: "AI predicts the best time to buy based on historical patterns" },
  { icon: <Search className="w-4 h-4" />, label: "Ad-free experience", desc: "Zero ads, clean interface, faster pages" },
  { icon: <Heart className="w-4 h-4" />, label: "Unlimited wishlist", desc: "Save as many products as you want" },
  { icon: <Zap className="w-4 h-4" />, label: "Exclusive deals first", desc: "See flash sales and deals 2 hours before free users" },
  { icon: <ShieldCheck className="w-4 h-4" />, label: "Premium badge", desc: "Stand out with a verified premium badge on reviews" },
  { icon: <Star className="w-4 h-4" />, label: "Priority support", desc: "Direct WhatsApp support channel" },
  { icon: <Sparkles className="w-4 h-4" />, label: "Export price data", desc: "Download price comparisons as PDF or Excel" },
];

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    nameAr: "شهري",
    price: 49,
    period: "/ month",
    badge: null,
    highlight: false,
  },
  {
    id: "yearly",
    name: "Yearly",
    nameAr: "سنوي",
    price: 399,
    period: "/ year",
    badge: "Save 32%",
    highlight: true,
    monthlyEquiv: "33 EGP/mo",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    nameAr: "مدى الحياة",
    price: 999,
    period: "one-time",
    badge: "Best Value",
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Ahmed M.",
    text: "Saved 800 EGP last month by catching price drops on baby formula and cooking oil. Worth every pound.",
    stars: 5,
  },
  {
    name: "Sara K.",
    text: "The hourly alerts are amazing. I got notified about a 40% drop on Nescafé at midnight and grabbed it immediately.",
    stars: 5,
  },
  {
    name: "Omar T.",
    text: "Finally an ad-free experience. The app is so much faster and cleaner. The price predictions are surprisingly accurate.",
    stars: 5,
  },
];

export default function PremiumPage() {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly" | "lifetime">("yearly");

  const selectedPlan = PLANS.find((p) => p.id === billingPeriod)!;

  const handleSubscribe = () => {
    // TODO: integrate with Stripe or Paymob
    const subject = encodeURIComponent(`BKAM Premium – ${selectedPlan.name} Plan`);
    const body = encodeURIComponent(
      `Hi BKAM team,\n\nI'd like to upgrade to the ${selectedPlan.name} Plan (${selectedPlan.price} EGP ${selectedPlan.period}).\n\nEmail: ${user?.email ?? "my email"}\n\nPlease send me payment details.`
    );
    window.open(`mailto:hello@bkam.app?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-20">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400 text-sm font-semibold mb-6">
            <Crown className="w-4 h-4" />
            BKAM Premium
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Shop smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Save more.
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Unlimited alerts, hourly price checks, AI predictions, and zero ads — for less than a cup of coffee a month.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mt-10 mb-8">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setBillingPeriod(plan.id as "monthly" | "yearly" | "lifetime")}
              className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                billingPeriod === plan.id
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {plan.name}
              {plan.badge && (
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                  {plan.badge}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Price card */}
        <motion.div
          key={billingPeriod}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 max-w-sm mx-auto mb-16 shadow-2xl shadow-amber-500/30"
        >
          <Crown className="w-10 h-10 text-white mx-auto mb-4" />
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-5xl font-black text-white">{selectedPlan.price}</span>
            <span className="text-amber-200 text-lg">EGP</span>
          </div>
          <p className="text-amber-200 text-sm mb-1">{selectedPlan.period}</p>
          {selectedPlan.id === "yearly" && (
            <p className="text-amber-100 text-xs mb-4">{selectedPlan.monthlyEquiv}</p>
          )}
          <button
            onClick={handleSubscribe}
            className="w-full py-3 bg-white text-orange-600 font-bold rounded-2xl hover:bg-amber-50 transition-all shadow-lg hover:scale-105 mt-2"
          >
            {user ? "Upgrade Now" : "Get Premium"}
          </button>
          {!user && (
            <p className="text-amber-200 text-xs mt-3">
              <Link href="/auth/register" className="underline">Create account</Link> or{" "}
              <Link href="/auth/login" className="underline">sign in</Link> to subscribe
            </p>
          )}
        </motion.div>
      </div>

      {/* Features section */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Everything in Premium</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {PREMIUM_FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-4 bg-slate-800/60 border border-slate-700 rounded-2xl p-4"
            >
              <div className="w-9 h-9 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400 flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{f.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Free vs Premium comparison */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-3xl overflow-hidden mb-16">
          <div className="grid grid-cols-3 bg-slate-800 p-4 text-center">
            <div />
            <div className="text-slate-400 text-sm font-semibold">Free</div>
            <div className="text-amber-400 text-sm font-bold flex items-center justify-center gap-1.5">
              <Crown className="w-4 h-4" />
              Premium
            </div>
          </div>
          {[
            ["Search & compare prices", true, true],
            ["Price history", "30 days", "1 year"],
            ["Price alerts", "3 max", "Unlimited"],
            ["Alert frequency", "Daily", "Hourly"],
            ["Wishlist", "10 items", "Unlimited"],
            ["Price predictions", false, true],
            ["Ad-free", false, true],
            ["Export data", false, true],
            ["Priority support", false, true],
          ].map(([label, free, premium], i) => (
            <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-slate-700/50 ${i % 2 === 0 ? "bg-slate-800/30" : ""}`}>
              <span className="text-slate-300">{label as string}</span>
              <span className="text-center">
                {free === true ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> :
                 free === false ? <X className="w-4 h-4 text-slate-600 mx-auto" /> :
                 <span className="text-slate-400 text-xs">{free as string}</span>}
              </span>
              <span className="text-center">
                {premium === true ? <Check className="w-4 h-4 text-amber-400 mx-auto" /> :
                 premium === false ? <X className="w-4 h-4 text-slate-600 mx-auto" /> :
                 <span className="text-amber-300 text-xs font-medium">{premium as string}</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <h2 className="text-2xl font-bold text-white text-center mb-8">What members say</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
              <div className="flex mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">{t.text}</p>
              <p className="text-slate-500 text-xs font-medium">— {t.name}</p>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-3xl overflow-hidden mb-16">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
          </div>
          {[
            ["How do I pay?", "We accept payment via Vodafone Cash, InstaPay, or bank transfer. After clicking Upgrade, you'll receive payment instructions by email."],
            ["Can I cancel anytime?", "Yes. Monthly plans can be cancelled before the next billing cycle. Yearly plans are refundable within 7 days of purchase."],
            ["When do alerts fire?", "Premium users get alerts within 1 hour of any price drop. Free users get daily digest alerts."],
            ["What is price prediction?", "Our algorithm analyzes historical price patterns to predict when a product is likely to go on sale — helping you decide when to buy vs. wait."],
            ["Is there a free trial?", "We offer a 7-day free trial of Premium for new users. No credit card required."],
          ].map(([q, a], i) => (
            <details key={i} className="border-t border-slate-700/50 group">
              <summary className="px-6 py-4 cursor-pointer text-slate-300 text-sm font-medium hover:text-white transition-colors list-none flex items-center justify-between">
                {q}
                <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-6 pb-4 text-slate-400 text-sm leading-relaxed">{a as string}</p>
            </details>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-center bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-3xl p-10">
          <Crown className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Start saving more today</h2>
          <p className="text-slate-400 text-sm mb-6">
            Join thousands of smart Egyptian shoppers on BKAM Premium
          </p>
          <button
            onClick={handleSubscribe}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 transition-all"
          >
            <Crown className="w-5 h-5" />
            Upgrade to Premium — {selectedPlan.price} EGP {selectedPlan.period}
          </button>
          <p className="text-slate-500 text-xs mt-4 flex items-center justify-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            Questions? Email us at hello@bkam.app
          </p>
        </motion.div>
      </div>
    </div>
  );
}
