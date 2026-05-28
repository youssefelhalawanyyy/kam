"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView, updateActiveSession } from "@/lib/analytics";

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem("bkam_sid");
    if (existing) return existing;
    const id =
      Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
    sessionStorage.setItem("bkam_sid", id);
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2, 9);
  }
}

export default function Analytics() {
  const pathname = usePathname();
  const sessionId = useRef<string>("");

  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  useEffect(() => {
    if (!sessionId.current) return;
    trackPageView(pathname, sessionId.current).catch(() => {});
    updateActiveSession(sessionId.current, pathname).catch(() => {});

    const interval = setInterval(() => {
      updateActiveSession(sessionId.current, pathname).catch(() => {});
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
