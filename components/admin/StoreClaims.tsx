"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  getStoreClaims,
  approveStoreClaim,
  rejectStoreClaim,
  StoreClaim,
  Store,
  UserProfile,
} from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";

interface Props {
  stores: Store[];
  users: UserProfile[];
}

export default function StoreClaims({ stores, users }: Props) {
  const { user } = useAuth();
  const [claims, setClaims] = useState<StoreClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getStoreClaims("pending");
        setClaims(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load claims");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleApprove = async (claim: StoreClaim) => {
    if (!user) return;
    if (!confirm(`Approve claim for store "${getStoreName(claim.storeId)}" by ${claim.businessName}?`)) return;
    setProcessingId(claim.id);
    try {
      await approveStoreClaim(claim.id, claim.storeId, claim.userId, user.uid);
      setClaims((prev) => prev.filter((c) => c.id !== claim.id));
      toast.success("Claim approved! Store ownership transferred.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve claim");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (claimId: string) => {
    if (!rejectReason.trim()) { toast.error("Please enter a rejection reason"); return; }
    setProcessingId(claimId);
    try {
      await rejectStoreClaim(claimId, rejectReason);
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
      setRejectingId(null);
      setRejectReason("");
      toast.success("Claim rejected.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject claim");
    } finally {
      setProcessingId(null);
    }
  };

  const getStoreName = (storeId: string) =>
    stores.find((s) => s.id === storeId)?.name || storeId;

  const getUserEmail = (userId: string) =>
    users.find((u) => u.id === userId)?.email || userId;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading claims...
        </div>
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
        <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-700">No Pending Claims</h3>
        <p className="text-slate-400 text-sm mt-1">All store claims have been processed.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h2 className="font-bold text-slate-800">Pending Store Claims</h2>
        <p className="text-sm text-slate-500">{claims.length} claim{claims.length !== 1 ? "s" : ""} awaiting review</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Store</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">User Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Business Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Phone</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Submitted</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {claims.map((claim) => (
                <motion.tr
                  key={claim.id}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-slate-50 hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800">{getStoreName(claim.storeId)}</p>
                    <p className="text-xs text-slate-400">{claim.storeId}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{getUserEmail(claim.userId)}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{claim.businessName}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{claim.phone}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {claim.createdAt
                      ? format((claim.createdAt as any).toDate?.() || new Date(), "MMM d, yyyy")
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(claim)}
                        disabled={processingId === claim.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        {processingId === claim.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingId(rejectingId === claim.id ? null : claim.id)}
                        disabled={processingId === claim.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                    {rejectingId === claim.id && (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Rejection reason..."
                          className="flex-1 px-3 py-1.5 text-xs border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                        <button
                          onClick={() => handleReject(claim.id)}
                          disabled={processingId === claim.id}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
