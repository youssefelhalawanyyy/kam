"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { PriceHistory, Store } from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";

interface Props {
  history: PriceHistory[];
  stores: Store[];
}

const COLORS = [
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

function toDate(ts: Timestamp | { seconds: number; nanoseconds: number } | Date) {
  if (ts instanceof Date) return ts;
  if (ts && typeof (ts as any).toDate === "function") return (ts as any).toDate();
  if (ts && (ts as any).seconds) return new Date((ts as any).seconds * 1000);
  return new Date();
}

export default function PriceHistoryChart({ history, stores }: Props) {
  if (!history.length) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No price history available yet.
      </div>
    );
  }

  const storeIds = [...new Set(history.map((h) => h.storeId))];

  // Group by date
  const dateMap = new Map<string, Record<string, number>>();

  history.forEach((h) => {
    const dateStr = format(toDate(h.date), "MMM dd");
    if (!dateMap.has(dateStr)) dateMap.set(dateStr, { date: dateStr } as any);
    const entry = dateMap.get(dateStr)!;
    const storeName =
      stores.find((s) => s.id === h.storeId)?.name || h.storeId;
    entry[storeName] = h.price;
  });

  const data = Array.from(dateMap.values());

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            fontSize: 12,
          }}
          formatter={(value) => [`${value} EGP`, ""]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
        />
        {storeIds.map((storeId, idx) => {
          const storeName =
            stores.find((s) => s.id === storeId)?.name || storeId;
          return (
            <Line
              key={storeId}
              type="monotone"
              dataKey={storeName}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 3, fill: COLORS[idx % COLORS.length] }}
              activeDot={{ r: 5 }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
