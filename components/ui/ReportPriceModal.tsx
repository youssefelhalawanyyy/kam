"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Check } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface Props {
  priceId: string;
  productName: string;
  storeName: string;
  currentPrice: number;
}

const REASONS = [
  "Price is wrong",
  "Product no longer available",
  "Store doesn't carry this",
  "Better price found elsewhere",
  "Other",
];

export default function ReportPriceModal({ priceId, productName, storeName, currentPrice }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");
  const [correctPrice, setCorrectPrice] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setSending(true);
    try {
      await addDoc(collection(db, "priceReports"), {
        priceId,
        productName,
        storeName,
        currentPrice,
        reason,
        note: note.trim(),
        correctPrice: correctPrice ? parseFloat(correctPrice) : null,
        reportedBy: user?.uid || "anonymous",
        createdAt: serverTimestamp(),
        status: "pending",
      });
      setDone(true);
      toast.success("Report submitted — thank you!");
      setTimeout(() => { setOpen(false); setDone(false); setNote(""); setCorrectPrice(""); }, 1500);
    } catch {
      toast.error("Failed to submit report");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
        title="Report wrong price"
      >
        <AlertTriangle className="w-3 h-3" />
        Report
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {done ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="font-bold text-slate-800">Report sent!</p>
                  <p className="text-sm text-slate-500 mt-1">Thanks for helping keep prices accurate</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Report Wrong Price</h3>
                      <p className="text-xs text-slate-500">{productName} at {storeName}</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="ml-auto text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Reason</label>
                      <div className="space-y-1.5">
                        {REASONS.map((r) => (
                          <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              type="radio"
                              name="reason"
                              value={r}
                              checked={reason === r}
                              onChange={() => setReason(r)}
                              className="accent-emerald-500"
                            />
                            <span className="text-sm text-slate-700 group-hover:text-slate-900">{r}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">
                        Correct price (optional)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={correctPrice}
                          onChange={(e) => setCorrectPrice(e.target.value)}
                          placeholder={`Current: ${currentPrice} EGP`}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">EGP</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Note (optional)</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Any extra details..."
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submit}
                      disabled={sending}
                      className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-60"
                    >
                      {sending ? "Sending..." : "Submit Report"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
