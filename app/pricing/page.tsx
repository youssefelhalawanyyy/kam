"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Shield, ChevronDown } from "lucide-react";
import { useState } from "react";

const FREE_FEATURES = [
  "Browse all prices",
  "Price comparison",
  "Basic search",
  "Up to 3 price alerts",
  "Wishlist (10 items)",
  "Basket calculator",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Unlimited price alerts",
  "Full 90-day price history",
  "CSV export",
  "Priority support",
  "Early access to new features",
  "Premium badge",
];

const FAQS = [
  {
    q: "How do I upgrade to Premium?",
    a: "Contact us via WhatsApp and we'll set up your account manually. We'll send you payment details for EGP payments via Vodafone Cash, Instapay, or bank transfer.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Your premium plan is monthly or yearly. You can cancel before the next billing cycle and your account reverts to Free.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Vodafone Cash, Instapay, bank transfer, and Fawry. Contact us on WhatsApp for details.",
  },
  {
    q: "Is there a free trial?",
    a: "We occasionally offer free trials for new users. Contact us on WhatsApp to ask about current promotions.",
  },
  {
    q: "What is the price history feature?",
    a: "Premium users can see the full 90-day price history chart for any product, helping you identify the best time to buy.",
  },
  {
    q: "How does the CSV export work?",
    a: "Premium users can export their wishlist, basket, and price alerts as a CSV file for use in Excel or Google Sheets.",
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const whatsappUrl = "https://wa.me/201000000000?text=I want to upgrade to BKAM Premium";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Zap className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-3">
            Choose your plan
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Start for free and upgrade when you need more power. All prices in EGP.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                billing === "monthly"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                billing === "yearly"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                Save 32%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Free</h2>
                <p className="text-xs text-slate-400">Always free</p>
              </div>
            </div>
            <div className="my-5">
              <span className="text-4xl font-extrabold text-slate-800">0</span>
              <span className="text-slate-500 ml-1">EGP / month</span>
            </div>
            <Link
              href="/auth/register"
              className="block w-full text-center px-5 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all mb-6"
            >
              Get started free
            </Link>
            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">
              POPULAR
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Premium</h2>
                <p className="text-xs text-emerald-100">Full access</p>
              </div>
            </div>
            <div className="my-5">
              <span className="text-4xl font-extrabold">
                {billing === "monthly" ? "49" : "399"}
              </span>
              <span className="text-emerald-100 ml-1">
                EGP / {billing === "monthly" ? "month" : "year"}
              </span>
              {billing === "yearly" && (
                <p className="text-emerald-200 text-sm mt-1">
                  That&apos;s ~33 EGP/month — save 189 EGP
                </p>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-5 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:shadow-lg transition-all mb-6"
            >
              Contact us to upgrade
            </a>
            <ul className="space-y-3">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-emerald-50">
                  <Check className="w-4 h-4 text-emerald-200 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-3 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-600 border-t border-slate-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm mb-3">
            Have questions? We&apos;re happy to help.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
