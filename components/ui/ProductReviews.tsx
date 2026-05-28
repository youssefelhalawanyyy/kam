"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, ThumbsUp, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { addReview, getProductReviews, Review } from "@/lib/firestore";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface ProductReviewsProps {
  productId: string;
}

function StarRating({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) {
  const [hover, setHover] = useState(0);
  const sz = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`transition-colors ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          <Star className={`${sz} transition-colors ${
            star <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`} />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    getProductReviews(productId).then((r) => {
      setReviews(r);
      setLoading(false);
    });
  }, [productId]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((n) => ({
    n, count: reviews.filter((r) => r.rating === n).length,
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Sign in to leave a review"); return; }
    if (!comment.trim()) { toast.error("Please write a comment"); return; }
    setSubmitting(true);
    try {
      await addReview(user.uid, profile?.name || user.email || "User", productId, rating, comment);
      toast.success("Review submitted! ⭐");
      setComment("");
      setRating(5);
      setShowForm(false);
      const updated = await getProductReviews(productId);
      setReviews(updated);
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-500" />
            Reviews
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => user ? setShowForm(!showForm) : toast.error("Sign in to review")}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium rounded-xl transition-all"
        >
          <Star className="w-4 h-4" />
          Write Review
        </button>
      </div>

      <div className="p-5">
        {/* Summary */}
        {reviews.length > 0 && (
          <div className="flex gap-6 mb-6 p-4 bg-slate-50 rounded-2xl">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-slate-800">{avgRating.toFixed(1)}</p>
              <StarRating value={Math.round(avgRating)} size="sm" />
              <p className="text-xs text-slate-400 mt-1">{reviews.length} total</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {ratingCounts.map(({ n, count }) => (
                <div key={n} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 w-3">{n}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-slate-400 w-3">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Write review form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="mb-6 bg-emerald-50 rounded-2xl p-4 overflow-hidden"
            >
              <p className="text-sm font-semibold text-slate-700 mb-3">Your Rating</p>
              <StarRating value={rating} onChange={setRating} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={3}
                className="w-full mt-3 px-4 py-3 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-xl hover:bg-white transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Reviews list */}
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {review.userName?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{review.userName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={review.rating} size="sm" />
                    {review.createdAt && (
                      <span className="text-xs text-slate-400">
                        {format(new Date(review.createdAt.seconds * 1000), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
