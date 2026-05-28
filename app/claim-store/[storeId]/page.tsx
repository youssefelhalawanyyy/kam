"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Store as StoreIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getStoreById, createStoreClaim, Store } from "@/lib/firestore";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function ClaimStorePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [store, setStore] = useState<Store | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    phone: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to claim a store");
      router.push(`/auth/login?redirect=/claim-store/${storeId}`);
    }
  }, [authLoading, user, storeId, router]);

  useEffect(() => {
    async function load() {
      const s = await getStoreById(storeId);
      setStore(s);
      if (s) {
        setForm((prev) => ({
          ...prev,
          businessName: s.name,
          email: profile?.email || "",
        }));
      }
      setStoreLoading(false);
    }
    if (storeId) load();
  }, [storeId, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !store) return;
    if (!form.phone) { toast.error("Phone number is required"); return; }

    setSubmitting(true);
    try {
      await createStoreClaim({
        storeId: store.id,
        userId: user.uid,
        businessName: form.businessName,
        phone: form.phone,
        email: form.email,
        status: "pending",
      });
      setSubmitted(true);
      toast.success("Claim submitted! We'll review it shortly.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit claim. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || storeLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-16">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-700">Store not found</h2>
          <p className="text-slate-500 text-sm mt-1">This store does not exist.</p>
        </div>
      </div>
    );
  }

  if (store.claimedBy) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-md w-full text-center"
        >
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Already Claimed</h2>
          <p className="text-slate-500 text-sm">
            This store has already been claimed by a verified owner.
          </p>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-md w-full text-center"
        >
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Claim Submitted!</h2>
          <p className="text-slate-500 text-sm mb-6">
            We&apos;ve received your claim for <strong>{store.name}</strong>. Our team will review
            it and contact you within 24–48 hours.
          </p>
          <button
            onClick={() => router.push("/stores")}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-md transition-all"
          >
            Back to Stores
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 px-4">
      <div className="max-w-lg mx-auto py-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {/* Store info header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <StoreIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-emerald-100 text-sm">Claim Ownership</p>
                <h1 className="text-xl font-bold">{store.name}</h1>
                {store.location && (
                  <p className="text-emerald-100 text-sm">{store.location}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-slate-600 text-sm mb-6">
              Fill in your business details to claim ownership of this store. Our team will
              verify your information and approve the claim within 24–48 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
                  Business Name
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 01012345678"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
                  Your Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
                  Message / Reason for Claiming (optional)
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us why you are the owner of this store..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Submitting..." : "Submit Claim"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
