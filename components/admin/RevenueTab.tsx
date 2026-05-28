"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, MousePointer, TrendingUp, Info, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAffiliateClicks, AffiliateClick } from "@/lib/firestore";
import toast from "react-hot-toast";

const COMMISSION_RATES: Record<string, number> = {
  jumia: 0.05,
  amazon: 0.04,
};
const DEFAULT_COMMISSION = 0.03;
const AVG_ORDER_EGP = 350;

function getCommission(store: string): number {
  const key = store.toLowerCase();
  if (key.includes("jumia")) return COMMISSION_RATES.jumia;
  if (key.includes("amazon")) return COMMISSION_RATES.amazon;
  return DEFAULT_COMMISSION;
}

interface StoreStats {
  store: string;
  clicks: number;
  estimatedRevenue: number;
}

export default function RevenueTab() {
  const [clicks, setClicks] = useState<AffiliateClick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAffiliateClicks({ limit: 1000 });
        setClicks(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load affiliate data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const storeMap = new Map<string, number>();
  clicks.forEach((c) => {
    storeMap.set(c.store, (storeMap.get(c.store) || 0) + 1);
  });

  const storeStats: StoreStats[] = Array.from(storeMap.entries())
    .map(([store, clickCount]) => ({
      store,
      clicks: clickCount,
      estimatedRevenue: clickCount * AVG_ORDER_EGP * getCommission(store),
    }))
    .sort((a, b) => b.clicks - a.clicks);

  const totalClicks = clicks.length;
  const totalRevenue = storeStats.reduce((sum, s) => sum + s.estimatedRevenue, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading revenue data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-blue-50 rounded-2xl p-5"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <MousePointer className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700">{totalClicks.toLocaleString()}</p>
          <p className="text-sm text-blue-600 opacity-70">Total Affiliate Clicks</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-50 rounded-2xl p-5"
        >
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{totalRevenue.toFixed(0)} EGP</p>
          <p className="text-sm text-emerald-600 opacity-70">Estimated Revenue</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-purple-50 rounded-2xl p-5"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700">{storeStats.length}</p>
          <p className="text-sm text-purple-600 opacity-70">Active Partner Stores</p>
        </motion.div>
      </div>

      {/* Bar chart */}
      {storeStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-800 mb-4">Clicks by Store</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={storeStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="store" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="clicks" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {storeStats.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Revenue by Store</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Store</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Clicks</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Commission Rate</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Est. Revenue (EGP)</th>
                </tr>
              </thead>
              <tbody>
                {storeStats.map((s) => (
                  <tr key={s.store} className="border-b border-slate-50 hover:bg-slate-50/70">
                    <td className="px-5 py-3 text-sm font-semibold text-slate-800">{s.store}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{s.clicks.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">
                      {(getCommission(s.store) * 100).toFixed(0)}%
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-emerald-700">
                      {s.estimatedRevenue.toFixed(0)} EGP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <MousePointer className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No Affiliate Clicks Yet</h3>
          <p className="text-slate-400 text-sm mt-1">
            Clicks will appear here as users visit affiliate product links.
          </p>
        </div>
      )}

      {/* How it works */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-800">How Earnings Work</h3>
        </div>
        <div className="text-sm text-slate-600 space-y-2">
          <p>
            BKAM earns affiliate commissions when users click product links and make purchases on
            partner stores.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>Jumia: 5% commission per sale</li>
            <li>Amazon Egypt: 4% commission per sale</li>
            <li>Other stores: 3% commission per sale</li>
          </ul>
          <p className="text-xs text-slate-400 mt-2">
            Revenue estimates assume avg. order value of {AVG_ORDER_EGP} EGP. Actual earnings
            depend on conversion rates.
          </p>
        </div>
      </div>
    </div>
  );
}
