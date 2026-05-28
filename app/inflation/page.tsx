"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus, BarChart2, Loader2,
  Info, Globe, Database,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend,
} from "recharts";
import type { CategoryInflation, InflationSnapshot } from "@/app/api/egypt-inflation/route";
import { getAllProducts, getPriceHistory, getAllStores } from "@/lib/firestore";
import type { Product, PriceHistory, Store } from "@/lib/firestore";
import { format } from "date-fns";

type Tab = "official" | "market";

export default function InflationPage() {
  const [tab, setTab] = useState<Tab>("official");
  const [loading, setLoading] = useState(true);
  const [snapshots, setSnapshots] = useState<InflationSnapshot[]>([]);
  const [categories, setCategories] = useState<CategoryInflation[]>([]);
  const [latest, setLatest] = useState<InflationSnapshot | null>(null);
  const [prevYear, setPrevYear] = useState<InflationSnapshot | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [dataNote, setDataNote] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/egypt-inflation")
      .then((r) => r.json())
      .then((d) => {
        setSnapshots(d.snapshots ?? []);
        setCategories(d.categories ?? []);
        setLatest(d.latest ?? null);
        setPrevYear(d.prevYear ?? null);
        setSources(d.sources ?? []);
        setDataNote(d.dataNote ?? "");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const chartData = snapshots.map((s) => ({
    year: String(s.year),
    "Overall CPI": s.overallRate,
    "Food Prices": s.foodRate ?? null,
  }));

  const delta =
    latest && prevYear ? latest.overallRate - prevYear.overallRate : null;

  const colorForRate = (rate: number) =>
    rate > 20 ? "#ef4444" : rate > 10 ? "#f59e0b" : rate > 5 ? "#f97316" : "#10b981";

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Egypt Inflation Tracker</h1>
              <p className="text-slate-500 text-sm">
                Real data from World Bank & IMF — updated annually
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setTab("official")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === "official"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-orange-300"
              }`}
            >
              <Globe className="w-4 h-4" />
              Official Statistics
            </button>
            <button
              onClick={() => setTab("market")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === "market"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300"
              }`}
            >
              <Database className="w-4 h-4" />
              Our Market Tracking
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-semibold">Failed to load inflation data</p>
            <p className="text-red-400 text-sm mt-1">Check your connection and try again</p>
          </div>
        ) : tab === "official" ? (
          <OfficialTab
            snapshots={snapshots}
            chartData={chartData}
            categories={categories}
            latest={latest}
            prevYear={prevYear}
            delta={delta}
            sources={sources}
            dataNote={dataNote}
            colorForRate={colorForRate}
          />
        ) : (
          <MarketTab />
        )}
      </div>
    </div>
  );
}

// ── Official Data Tab ──────────────────────────────────────────────────────────
function OfficialTab({
  snapshots,
  chartData,
  categories,
  latest,
  prevYear,
  delta,
  sources,
  dataNote,
  colorForRate,
}: {
  snapshots: InflationSnapshot[];
  chartData: Array<{ year: string; "Overall CPI": number; "Food Prices": number | null }>;
  categories: CategoryInflation[];
  latest: InflationSnapshot | null;
  prevYear: InflationSnapshot | null;
  delta: number | null;
  sources: string[];
  dataNote: string;
  colorForRate: (rate: number) => string;
}) {
  return (
    <>
      {/* Hero stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-orange-100 p-5 lg:col-span-2">
          <p className="text-xs font-semibold text-slate-400 mb-1">
            EGYPT INFLATION {latest?.year}
          </p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black" style={{ color: colorForRate(latest?.overallRate ?? 0) }}>
              {latest?.overallRate ?? "—"}%
            </span>
            {delta !== null && (
              <span className={`text-sm font-semibold mb-2 flex items-center gap-1 ${
                delta > 0 ? "text-red-500" : "text-emerald-500"
              }`}>
                {delta > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {delta > 0 ? "+" : ""}{delta.toFixed(1)}% vs {prevYear?.year}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Annual consumer price inflation</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-red-100 p-5">
          <p className="text-xs font-semibold text-slate-400 mb-1">FOOD INFLATION</p>
          <span className="text-3xl font-black" style={{ color: colorForRate(latest?.foodRate ?? 0) }}>
            {latest?.foodRate ?? "—"}%
          </span>
          <p className="text-xs text-slate-400 mt-1">Food & beverages {latest?.year}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-semibold text-slate-400 mb-1">PEAK YEAR</p>
          {(() => {
            const peak = [...snapshots].sort((a, b) => b.overallRate - a.overallRate)[0];
            return (
              <>
                <span className="text-3xl font-black text-red-600">{peak?.overallRate ?? "—"}%</span>
                <p className="text-xs text-slate-400 mt-1">{peak?.year} highest rate</p>
              </>
            );
          })()}
        </motion.div>
      </div>

      {/* Historical chart */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-800">Egypt CPI — Historical Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Annual % change in consumer prices</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-medium">
              {snapshots[0]?.year} – {snapshots[snapshots.length - 1]?.year}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="foodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(v) => [`${Number(v).toFixed(1)}%`]}
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="Overall CPI"
                stroke="#f97316"
                fill="url(#overallGrad)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#f97316" }}
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="Food Prices"
                stroke="#ef4444"
                fill="url(#foodGrad)"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Category breakdown */}
      {categories.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
          <h2 className="font-bold text-slate-800 mb-1">Category Breakdown</h2>
          <p className="text-xs text-slate-400 mb-5">
            Estimated {latest?.year} inflation per category — based on CAPMAS Egypt CPI basket weights
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {categories.map((cat, i) => (
              <motion.div key={cat.category}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{cat.category}</p>
                  <p className="text-xs text-slate-400">{cat.weight}% of basket</p>
                  <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(cat.rate * 1.5, 100)}%`,
                        backgroundColor: colorForRate(cat.rate),
                      }}
                    />
                  </div>
                </div>
                <span className="text-lg font-extrabold flex-shrink-0"
                  style={{ color: colorForRate(cat.rate) }}>
                  {cat.rate > 0 ? "+" : ""}{cat.rate}%
                </span>
              </motion.div>
            ))}
          </div>

          {/* Bar chart */}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categories} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="icon" tick={{ fontSize: 16 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(v) => [`${Number(v).toFixed(1)}%`]}
                labelFormatter={(label) => categories.find((c) => c.icon === label)?.category ?? label}
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                {categories.map((cat) => (
                  <Cell key={cat.category} fill={colorForRate(cat.rate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Year table */}
      {snapshots.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Year-by-Year Data</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <th className="text-left px-5 py-3 font-semibold">Year</th>
                  <th className="text-right px-5 py-3 font-semibold">Overall CPI %</th>
                  <th className="text-right px-5 py-3 font-semibold">Food %</th>
                  <th className="text-right px-5 py-3 font-semibold">YoY Change</th>
                  <th className="text-right px-5 py-3 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody>
                {[...snapshots].reverse().map((s, i) => {
                  const prev = snapshots[snapshots.indexOf(s) - 1];
                  const change = prev ? s.overallRate - prev.overallRate : null;
                  return (
                    <tr key={s.year} className={`border-t border-slate-50 ${i === 0 ? "bg-orange-50" : "hover:bg-slate-50"}`}>
                      <td className="px-5 py-3 font-bold text-slate-800">
                        {s.year}
                        {i === 0 && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">Latest</span>}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold" style={{ color: colorForRate(s.overallRate) }}>
                        {s.overallRate}%
                      </td>
                      <td className="px-5 py-3 text-right text-slate-600">
                        {s.foodRate != null ? `${s.foodRate}%` : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {change !== null ? (
                          <span className={`font-medium ${change > 0 ? "text-red-500" : "text-emerald-500"}`}>
                            {change > 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-slate-400">{s.source}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Sources note */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-800">Data Sources</p>
          <p className="text-xs text-blue-600 mt-0.5">{sources.join(" · ")}</p>
          {dataNote && <p className="text-xs text-blue-500 mt-1">{dataNote}</p>}
        </div>
      </div>
    </>
  );
}

// ── Market Tracking Tab ────────────────────────────────────────────────────────

const STAPLES = ["rice", "sugar", "milk", "oil", "pasta", "eggs", "bread", "tea"];
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

interface ProductTrend {
  product: Product;
  history: PriceHistory[];
  currentAvg: number;
  pastAvg: number;
  pctChange: number;
  trend: "up" | "down" | "stable";
}

function MarketTab() {
  const [trends, setTrends] = useState<ProductTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<Array<{ date: string; [k: string]: number | string }>>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [products] = await Promise.all([getAllProducts(), getAllStores()]);
      const staples = products
        .filter((p) => STAPLES.some((s) => p.name.toLowerCase().includes(s) || p.nameAr?.includes(s)))
        .slice(0, 12);

      const results = await Promise.all(
        staples.map(async (product) => {
          const history = await getPriceHistory(product.id);
          if (history.length < 2) return null;
          const sorted = [...history].sort((a, b) => a.date.seconds - b.date.seconds);
          const half = Math.floor(sorted.length / 2);
          const pastAvg = sorted.slice(0, half).reduce((s, p) => s + p.price, 0) / half;
          const recentLen = sorted.length - half;
          const currentAvg = sorted.slice(half).reduce((s, p) => s + p.price, 0) / recentLen;
          const pctChange = ((currentAvg - pastAvg) / pastAvg) * 100;
          return {
            product, history: sorted, currentAvg, pastAvg, pctChange,
            trend: pctChange > 2 ? "up" : pctChange < -2 ? "down" : "stable",
          } as ProductTrend;
        })
      );

      const valid = results.filter(Boolean) as ProductTrend[];
      setTrends(valid);

      // Build chart
      const dateMap = new Map<string, Record<string, number | string>>();
      for (const t of valid.slice(0, 5)) {
        for (const h of t.history) {
          const d = format(new Date(h.date.seconds * 1000), "MMM d");
          if (!dateMap.has(d)) dateMap.set(d, { date: d });
          const pt = dateMap.get(d)!;
          const key = t.product.name.split(" ")[0];
          pt[key] = pt[key] ? ((pt[key] as number) + h.price) / 2 : h.price;
        }
      }
      setChartData(Array.from(dateMap.values()).slice(-30) as { date: string; [k: string]: string | number }[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-emerald-500" /></div>;

  if (trends.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
        <BarChart2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Not enough price history yet</p>
        <p className="text-slate-400 text-sm mt-1">Trends appear as price data is collected over time</p>
      </div>
    );
  }

  return (
    <>
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
          <h2 className="font-bold text-slate-800 mb-4">Our Price Trends (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} EGP`} />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} EGP`]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend />
              {trends.slice(0, 5).map((t, i) => (
                <Area key={t.product.id} type="monotone" dataKey={t.product.name.split(" ")[0]}
                  stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length] + "15"}
                  strokeWidth={2} dot={false} connectNulls />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {trends.map((t, i) => (
          <motion.div key={t.product.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-800">{t.product.name}</h3>
                <p className="text-xs text-slate-400">{t.product.category}</p>
              </div>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-bold ${
                t.trend === "up" ? "bg-red-50 text-red-600" :
                t.trend === "down" ? "bg-emerald-50 text-emerald-600" :
                "bg-slate-50 text-slate-600"
              }`}>
                {t.trend === "up" ? <TrendingUp className="w-4 h-4" /> :
                 t.trend === "down" ? <TrendingDown className="w-4 h-4" /> :
                 <Minus className="w-4 h-4" />}
                {t.pctChange > 0 ? "+" : ""}{t.pctChange.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-slate-400 text-xs">Was</p>
                <p className="font-semibold text-slate-600">{t.pastAvg.toFixed(1)} EGP</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs">Now</p>
                <p className="font-bold text-slate-800">{t.currentAvg.toFixed(1)} EGP</p>
              </div>
            </div>
            {t.history.length > 2 && (
              <div className="mt-3 h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={t.history.map((h) => ({ price: h.price }))}>
                    <Area type="monotone" dataKey="price"
                      stroke={t.trend === "up" ? "#ef4444" : t.trend === "down" ? "#10b981" : "#64748b"}
                      fill={t.trend === "up" ? "#fef2f2" : t.trend === "down" ? "#f0fdf4" : "#f8fafc"}
                      strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </>
  );
}
