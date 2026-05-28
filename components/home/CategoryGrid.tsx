"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const CATEGORIES = [
  { id: "pharmacy", label: "Pharmacy", labelAr: "صيدلية", icon: "💊", color: "from-blue-500 to-indigo-600", light: "bg-blue-50 border-blue-100" },
  { id: "dairy", label: "Dairy & Eggs", labelAr: "ألبان وبيض", icon: "🥛", color: "from-yellow-400 to-amber-500", light: "bg-yellow-50 border-yellow-100" },
  { id: "grains", label: "Grains & Rice", labelAr: "حبوب وأرز", icon: "🌾", color: "from-orange-400 to-amber-500", light: "bg-orange-50 border-orange-100" },
  { id: "oils", label: "Oils", labelAr: "زيوت", icon: "🫙", color: "from-emerald-500 to-teal-600", light: "bg-emerald-50 border-emerald-100" },
  { id: "pantry", label: "Pantry", labelAr: "مؤونة المطبخ", icon: "🍚", color: "from-purple-500 to-indigo-600", light: "bg-purple-50 border-purple-100" },
  { id: "canned", label: "Canned Goods", labelAr: "معلبات", icon: "🥫", color: "from-red-400 to-rose-600", light: "bg-red-50 border-red-100" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function CategoryGrid() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            Browse by Category
          </span>
          <h2 className="text-3xl font-bold text-slate-800 mt-2">
            What are you looking for?
          </h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">
            Explore products by category and find the best prices in your area.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.id} variants={itemVariants}>
              <Link href={`/search?category=${cat.id}`}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${cat.light} hover:shadow-md transition-all cursor-pointer group`}
                >
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}
                  >
                    {cat.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700 leading-tight">
                      {cat.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.labelAr}</p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
