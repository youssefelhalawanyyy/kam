"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, X, Check, MapPin } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface Props { productId: string; productName: string; }

export default function SubmitPriceModal({ productId, productName }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!storeName.trim() || !price || isNaN(parseFloat(price))) {
      toast.error("Please fill in store name and price"); return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, "userPriceSubmissions"), {
        productId,
        productName,
        storeName: storeName.trim(),
        location: location.trim(),
        price: parseFloat(price),
        submittedBy: user?.uid || "anonymous",
        createdAt: serverTimestamp(),
        status: "pending",
      });
      setDone(true);
      toast.success("Price submitted! Our team will review it.");
      setTimeout(() => { setOpen(false); setDone(false); setStoreName(""); setLocation(""); setPrice(""); }, 1500);
    } catch {
      toast.error("Submission failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        Add a price
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {done ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="font-bold text-slate-800">Thanks!</p>
                  <p className="text-sm text-slate-500 mt-1">Your price will be reviewed and added</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <PlusCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Submit a Price</h3>
                      <p className="text-xs text-slate-500">Saw a price in a store? Share it!</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="ml-auto text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs font-medium text-slate-500 mb-4 bg-slate-50 px-3 py-2 rounded-xl">
                    Product: <span className="font-bold text-slate-700">{productName}</span>
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Store Name *</label>
                      <input
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. Carrefour Maadi"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">
                        <MapPin className="w-3 h-3 inline mr-1" />Location (optional)
                      </label>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Road 9, Maadi"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Price *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">EGP</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5">
                    <button onClick={() => setOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-all">
                      Cancel
                    </button>
                    <button onClick={submit} disabled={sending}
                      className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-all disabled:opacity-60">
                      {sending ? "Submitting..." : "Submit Price"}
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
