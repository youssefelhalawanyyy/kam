import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export interface PageView {
  id?: string;
  page: string;
  sessionId: string;
  date: string; // YYYY-MM-DD
  timestamp: Timestamp;
}

export interface ActiveSession {
  id: string;
  page: string;
  lastSeen: Timestamp;
}

export async function trackPageView(page: string, sessionId: string): Promise<void> {
  await addDoc(collection(db, "pageViews"), {
    page,
    sessionId,
    date: new Date().toISOString().split("T")[0],
    timestamp: serverTimestamp(),
  });
}

export async function updateActiveSession(sessionId: string, page: string): Promise<void> {
  await setDoc(
    doc(db, "activeSessions", sessionId),
    { page, lastSeen: serverTimestamp() },
    { merge: true }
  );
}

export async function getPageViewsStats(): Promise<{
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
  byPage: Record<string, number>;
  byDay: { date: string; views: number }[];
  uniqueSessions: number;
}> {
  const snap = await getDocs(collection(db, "pageViews"));
  const all = snap.docs.map((d) => d.data() as PageView);

  const todayStr = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const toDate = (d: string) => new Date(d);

  const today = all.filter((v) => v.date === todayStr).length;
  const last7 = all.filter((v) => toDate(v.date) >= sevenDaysAgo).length;
  const last30 = all.filter((v) => toDate(v.date) >= thirtyDaysAgo).length;

  // By page
  const byPage: Record<string, number> = {};
  for (const v of all) {
    byPage[v.page] = (byPage[v.page] || 0) + 1;
  }

  // By day (last 14 days)
  const byDayMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDayMap[d.toISOString().split("T")[0]] = 0;
  }
  for (const v of all) {
    if (byDayMap[v.date] !== undefined) {
      byDayMap[v.date]++;
    }
  }
  const byDay = Object.entries(byDayMap).map(([date, views]) => ({ date, views }));

  // Unique sessions
  const sessions = new Set(all.map((v) => v.sessionId));

  return {
    total: all.length,
    today,
    last7Days: last7,
    last30Days: last30,
    byPage,
    byDay,
    uniqueSessions: sessions.size,
  };
}

export async function getActiveSessions(): Promise<ActiveSession[]> {
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  const snap = await getDocs(
    query(
      collection(db, "activeSessions"),
      where("lastSeen", ">=", Timestamp.fromDate(fiveMinutesAgo))
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActiveSession));
}

export function subscribeToActiveSessions(callback: (sessions: ActiveSession[]) => void) {
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  return onSnapshot(
    query(
      collection(db, "activeSessions"),
      where("lastSeen", ">=", Timestamp.fromDate(fiveMinutesAgo))
    ),
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActiveSession)));
    }
  );
}
