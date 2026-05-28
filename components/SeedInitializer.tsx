"use client";
import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SeedInitializer() {
  useEffect(() => {
    async function maybeSeed() {
      try {
        // Check if products already exist — avoid re-seeding
        const snap = await getDocs(collection(db, "products"));
        if (!snap.empty) return;

        // Call the force-seed API route (server-side, bypasses client-side Firestore rules)
        const res = await fetch("/api/seed/force", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          console.log("BKAM: Database seeded →", data.message);
        } else {
          console.warn("BKAM: Seed failed →", data.error);
        }
      } catch (err) {
        console.warn("BKAM: Seed error →", err);
      }
    }
    maybeSeed();
  }, []);

  return null;
}
