"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Product } from "@/lib/firestore";

const MAX_COMPARE = 3;

interface CompareContextType {
  items: Product[];
  ids: Set<string>;
  toggle: (product: Product) => void;
  isComparing: (productId: string) => boolean;
  clear: () => void;
  count: number;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [ids, setIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((product: Product) => {
    if (ids.has(product.id)) {
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      setIds((prev) => { const s = new Set(prev); s.delete(product.id); return s; });
    } else {
      if (items.length >= MAX_COMPARE) {
        toast.error(`Max ${MAX_COMPARE} products to compare`);
        return;
      }
      setItems((prev) => [...prev, product]);
      setIds((prev) => new Set([...prev, product.id]));
      toast.success("Added to compare");
    }
  }, [items, ids]);

  const isComparing = useCallback((productId: string) => ids.has(productId), [ids]);
  const clear = useCallback(() => { setItems([]); setIds(new Set()); }, []);

  return (
    <CompareContext.Provider value={{ items, ids, toggle, isComparing, clear, count: items.length }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be inside CompareProvider");
  return ctx;
}
