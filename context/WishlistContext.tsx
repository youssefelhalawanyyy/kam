"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  WishlistItem,
} from "@/lib/firestore";
import toast from "react-hot-toast";

interface WishlistContextType {
  items: WishlistItem[];
  ids: Set<string>;
  toggle: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { setItems([]); setIds(new Set()); return; }
    getUserWishlist(user.uid).then((list) => {
      setItems(list);
      setIds(new Set(list.map((i) => i.productId)));
    });
  }, [user]);

  const toggle = useCallback(async (productId: string) => {
    if (!user) { toast.error("Sign in to save products"); return; }
    if (ids.has(productId)) {
      await removeFromWishlist(user.uid, productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      setIds((prev) => { const s = new Set(prev); s.delete(productId); return s; });
      toast.success("Removed from wishlist");
    } else {
      await addToWishlist(user.uid, productId);
      const newItem: WishlistItem = {
        id: Date.now().toString(),
        userId: user.uid,
        productId,
        addedAt: { seconds: Date.now() / 1000 } as never,
      };
      setItems((prev) => [...prev, newItem]);
      setIds((prev) => new Set([...prev, productId]));
      toast.success("Added to wishlist ❤️");
    }
  }, [user, ids]);

  const isWishlisted = useCallback((productId: string) => ids.has(productId), [ids]);

  return (
    <WishlistContext.Provider value={{ items, ids, toggle, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be inside WishlistProvider");
  return ctx;
}
