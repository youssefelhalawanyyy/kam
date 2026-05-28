import React from "react";
import Link from "next/link";
import { Search, Bell, ShoppingBasket, BarChart2, Store, Star, Shield, Zap } from "lucide-react";

const steps = [
  {
    icon: <Search className="w-6 h-6" />,
    color: "bg-emerald-100 text-emerald-600",
    title: "Search any product",
    titleAr: "ابحث عن أي منتج",
    desc: "Type a product name in Arabic or English — rice, milk, paracetamol, hoodie. BKAM searches tracked products and live Egyptian markets simultaneously.",
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    color: "bg-blue-100 text-blue-600",
    title: "Compare prices instantly",
    titleAr: "قارن الأسعار فوراً",
    desc: "See prices from Carrefour, Kheir Zaman, Metro, Seoudi, Hyper One, Jumia, Amazon Egypt, and 50+ Egyptian local brands — all in one place.",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    color: "bg-amber-100 text-amber-600",
    title: "Set price alerts",
    titleAr: "فعّل تنبيهات الأسعار",
    desc: "Set your target price for any product. We'll notify you the moment any store drops to or below that price — so you never miss a deal.",
  },
  {
    icon: <ShoppingBasket className="w-6 h-6" />,
    color: "bg-purple-100 text-purple-600",
    title: "Smart basket",
    titleAr: "السلة الذكية",
    desc: "Add your whole shopping list to the basket. BKAM automatically calculates which single store is cheapest for your entire list.",
  },
];

const dataSources = [
  { name: "Jumia Egypt", desc: "Live prices scraped from product listings", emoji: "🟠" },
  { name: "Amazon Egypt", desc: "Live prices scraped from search results", emoji: "🟡" },
  { name: "Hyper One", desc: "Live via Magento GraphQL API", emoji: "🔴" },
  { name: "Gourmet Egypt", desc: "Live via Magento GraphQL API", emoji: "🟤" },
  { name: "Carrefour Egypt", desc: "Live via API", emoji: "🔵" },
  { name: "50+ Local Brands", desc: "Live via Shopify product API", emoji: "🇪🇬" },
  { name: "BKAM Tracked", desc: "Manually verified & community-submitted prices", emoji: "✅" },
];

const faqs = [
  {
    q: "How often are prices updated?",
    a: "Live market prices update every time you search (fetched in real-time). BKAM tracked prices are updated by store owners and community members.",
  },
  {
    q: "Are prices always accurate?",
    a: "Live prices come directly from retailer websites so they reflect current online prices. In-store prices may differ — always verify at checkout.",
  },
  {
    q: "How do I submit a wrong price?",
    a: "Click the 'Report' button next to any price in the comparison table. Our team reviews all reports within 24 hours.",
  },
  {
    q: "Is BKAM free?",
    a: "Yes — BKAM is free for all users. Premium users get unlimited price alerts, hourly checks, and ad-free browsing.",
  },
  {
    q: "How do I get my store listed?",
    a: "Visit the Stores page and click 'Claim this store', or contact us on WhatsApp. Verified stores can update their own prices.",
  },
  {
    q: "Does BKAM work as a mobile app?",
    a: "Yes — tap 'Add to Home Screen' in your browser to install BKAM as a PWA app. Works on iPhone and Android.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Shield className="w-4 h-4" /> Transparent & Free
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">How BKAM Works</h1>
          <p className="text-emerald-100 text-lg mb-1">كيف يعمل بكام؟</p>
          <p className="text-emerald-200 text-sm max-w-xl mx-auto">
            BKAM compares grocery and pharmacy prices across Egypt so you always buy at the best price.
            Here&apos;s exactly how we do it.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Steps */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" /> How to use BKAM
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {steps.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400">Step {i + 1}</span>
                  </div>
                  <h3 className="font-bold text-slate-800">{step.title}</h3>
                  <p className="text-xs text-slate-400 mb-2" dir="rtl">{step.titleAr}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-500" /> Where our data comes from
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            BKAM pulls live prices directly from retailer websites and APIs — no middlemen, no stale data.
          </p>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {dataSources.map((src, i) => (
              <div key={i} className={`flex items-center gap-4 px-6 py-4 ${i < dataSources.length - 1 ? "border-b border-slate-50" : ""}`}>
                <span className="text-2xl">{src.emoji}</span>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{src.name}</p>
                  <p className="text-xs text-slate-400">{src.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-2xl border border-slate-100 group">
                <summary className="px-6 py-4 font-semibold text-slate-800 text-sm cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform text-lg">↓</span>
                </summary>
                <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Start saving money today</h3>
          <p className="text-emerald-100 text-sm mb-5">
            Join thousands of Egyptians comparing prices with BKAM
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/search"
              className="bg-white text-emerald-700 font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-50 transition-all text-sm">
              Search Prices
            </Link>
            <Link href="/auth/register"
              className="bg-white/20 text-white border border-white/30 font-semibold px-6 py-2.5 rounded-xl hover:bg-white/30 transition-all text-sm">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
