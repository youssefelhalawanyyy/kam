"use client";
import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, X, ArrowRight } from "lucide-react";
import { useCompare } from "@/context/CompareContext";

export default function CompareBar() {
  const { items, toggle, clear, count } = useCompare();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
        >
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <GitCompare className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {items.map((p) => (
                <div key={p.id}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-slate-800 rounded-xl px-2.5 py-1.5">
                  <span className="text-white text-xs font-medium max-w-[80px] truncate">{p.name}</span>
                  <button onClick={() => toggle(p)} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={clear} className="text-slate-500 hover:text-white text-xs transition-colors">
                Clear
              </button>
              <Link href="/compare"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all">
                Compare {count}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
