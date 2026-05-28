"use client";
import React from "react";
import { motion } from "framer-motion";
import { Trophy, MapPin, Clock, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
import { Price, Store } from "@/lib/firestore";
import { format, differenceInDays } from "date-fns";
import { Timestamp } from "firebase/firestore";
import ReportPriceModal from "./ReportPriceModal";

interface Props {
  prices: Price[];
  stores: Store[];
  productName?: string;
}

function FreshnessTag({ date }: { date: Date }) {
  const days = differenceInDays(new Date(), date);
  if (days <= 3) return <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">Fresh</span>;
  if (days <= 14) return <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">{days}d ago</span>;
  if (days <= 30) return <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">{days}d ago</span>;
  return <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full font-medium">Old data</span>;
}

function toDate(ts: any): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
}

export default function PriceTable({ prices, stores, productName = "" }: Props) {
  if (!prices.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-lg font-medium">No prices available</p>
        <p className="text-sm mt-1">Be the first to add pricing data</p>
      </div>
    );
  }

  const sorted = [...prices].sort((a, b) => a.price - b.price);
  const minPrice = sorted[0].price;
  const maxPrice = sorted[sorted.length - 1].price;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Store
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Location
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Price
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((price, idx) => {
            const store = stores.find((s) => s.id === price.storeId);
            const isCheapest = price.price === minPrice;
            const isMostExpensive = price.price === maxPrice && sorted.length > 1;
            const savings = price.price - minPrice;

            return (
              <motion.tr
                key={price.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${
                  isCheapest ? "bg-emerald-50/50" : ""
                }`}
              >
                {/* Rank */}
                <td className="py-3 px-4">
                  {isCheapest ? (
                    <div className="flex items-center justify-center w-7 h-7 bg-emerald-500 rounded-lg">
                      <Trophy className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : (
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                      {idx + 1}
                    </span>
                  )}
                </td>

                {/* Store */}
                <td className="py-3 px-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 text-sm">
                        {store?.name || "Unknown Store"}
                      </p>
                      {isCheapest && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          Best Price
                        </span>
                      )}
                    </div>
                    {store?.nameAr && (
                      <p className="text-xs text-slate-400">{store.nameAr}</p>
                    )}
                  </div>
                </td>

                {/* Location */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{store?.location || "—"}</span>
                  </div>
                </td>

                {/* Price */}
                <td className="py-3 px-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-lg font-bold ${
                          isCheapest
                            ? "text-emerald-600"
                            : isMostExpensive
                            ? "text-red-500"
                            : "text-slate-800"
                        }`}
                      >
                        {price.price}
                      </span>
                      <span className="text-xs text-slate-500">EGP</span>
                      {isMostExpensive && sorted.length > 1 && (
                        <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                      )}
                      {isCheapest && sorted.length > 1 && (
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    {!isCheapest && savings > 0 && (
                      <p className="text-xs text-slate-400">
                        +{savings} EGP more
                      </p>
                    )}
                  </div>
                </td>

                {/* Updated + report */}
                <td className="py-3 px-4 hidden sm:table-cell">
                  <div className="space-y-1">
                    {price.updatedAt ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {format(toDate(price.updatedAt), "MMM d, yyyy")}
                      </div>
                    ) : <span className="text-xs text-slate-300">—</span>}
                    {price.updatedAt && <FreshnessTag date={toDate(price.updatedAt)} />}
                    <ReportPriceModal
                      priceId={price.id}
                      productName={productName}
                      storeName={store?.name || "Unknown"}
                      currentPrice={price.price}
                    />
                  </div>
                </td>
                {/* Verified store badge */}
                {store?.verified && (
                  <td className="py-3 px-2 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-emerald-600" title="Verified store">
                      <CheckCircle className="w-4 h-4 fill-emerald-100" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  </td>
                )}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
