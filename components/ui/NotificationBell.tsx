"use client";
import React, { useState, useEffect } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

// ⚠️  Replace with your VAPID key from Firebase Console →
//     Project Settings → Cloud Messaging → Web Push certificates → Key pair
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

export default function NotificationBell() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"default" | "granted" | "denied" | "loading">("default");

  useEffect(() => {
    if (!("Notification" in window)) return;
    setStatus(Notification.permission as "default" | "granted" | "denied");
  }, []);

  async function requestPermission() {
    if (!user) { toast.error("Sign in to enable notifications"); return; }
    if (!("Notification" in window)) { toast.error("Notifications not supported in this browser"); return; }
    if (!VAPID_KEY) { toast.error("Push notifications not configured yet"); return; }

    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("denied"); toast.error("Notifications blocked"); return; }

      // Get FCM token
      const { getMessaging, getToken } = await import("firebase/messaging");
      const { app } = await import("@/lib/firebase");
      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js"),
      });

      if (token) {
        await setDoc(doc(db, "notificationTokens", user.uid), {
          token, userId: user.uid, createdAt: serverTimestamp(), platform: "web",
        });
        setStatus("granted");
        toast.success("Price drop alerts enabled!");
      }
    } catch (err) {
      console.error(err);
      setStatus("default");
      toast.error("Failed to enable notifications");
    }
  }

  if (status === "granted") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
        <Check className="w-3.5 h-3.5" />
        Alerts on
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400" title="Notifications blocked in browser settings">
        <BellOff className="w-4 h-4" />
      </div>
    );
  }

  return (
    <button
      onClick={requestPermission}
      disabled={status === "loading"}
      className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-600 transition-colors"
      title="Enable price drop alerts"
    >
      <Bell className={`w-4 h-4 ${status === "loading" ? "animate-pulse" : ""}`} />
      <span className="hidden sm:inline">Price alerts</span>
    </button>
  );
}
