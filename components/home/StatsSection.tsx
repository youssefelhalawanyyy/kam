"use client";
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Globe, Clock } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Real-Time Prices",
    desc: "Prices updated by stores directly — always fresh and accurate.",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  {
    icon: Globe,
    title: "Arabic & English",
    desc: "Search in both languages for the most convenient experience.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: ShieldCheck,
    title: "Verified Stores",
    desc: "All partner stores are verified for authenticity and reliability.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Clock,
    title: "Price History",
    desc: "Track price trends over time to make smarter buying decisions.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            Why BKAM?
          </span>
          <h2 className="text-3xl font-bold text-slate-800 mt-2">
            Smart Shopping Made Easy
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all bg-white"
            >
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-10 text-center overflow-hidden relative"
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute -top-10 -right-10 w-60 h-60 bg-white rounded-full opacity-10"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 8, repeat: Infinity, delay: 2 }}
              className="absolute -bottom-10 -left-10 w-60 h-60 bg-white rounded-full opacity-10"
            />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Own a Store in Egypt?
            </h3>
            <p className="text-emerald-100 mb-6 max-w-md mx-auto">
              Join BKAM and reach thousands of shoppers looking for the best deals
              on groceries and pharmacy products.
            </p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/auth/register"
              className="inline-block px-8 py-3.5 bg-white text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all shadow-lg"
            >
              Register Your Store
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
