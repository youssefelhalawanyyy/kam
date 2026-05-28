"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";
import {
  getUserProfile,
  createUserProfile,
  UserProfile,
} from "@/lib/firestore";

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
  isStore: boolean;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const ADMIN_EMAIL = "admin@bkam.eg";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const prof = await getUserProfile(firebaseUser.uid);
        setProfile(prof);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const role = email === ADMIN_EMAIL ? "admin" : "user";
    await createUserProfile(cred.user.uid, {
      email,
      name,
      role,
    });
    const prof = await getUserProfile(cred.user.uid);
    setProfile(prof);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const existing = await getUserProfile(cred.user.uid);
    if (!existing) {
      const role = cred.user.email === ADMIN_EMAIL ? "admin" : "user";
      await createUserProfile(cred.user.uid, {
        email: cred.user.email || "",
        name: cred.user.displayName || "",
        role,
      });
      const prof = await getUserProfile(cred.user.uid);
      setProfile(prof);
    }
  };

  const loginWithApple = async () => {
    const cred = await signInWithPopup(auth, appleProvider);
    const existing = await getUserProfile(cred.user.uid);
    if (!existing) {
      const role = cred.user.email === ADMIN_EMAIL ? "admin" : "user";
      await createUserProfile(cred.user.uid, {
        email: cred.user.email || "",
        name: cred.user.displayName || "",
        role,
      });
      const prof = await getUserProfile(cred.user.uid);
      setProfile(prof);
    }
  };

  const isAdmin = profile?.role === "admin" || user?.email === ADMIN_EMAIL;
  const isStore = profile?.role === "store" || profile?.role === "admin";
  const isPremium =
    profile?.plan === "premium" &&
    (profile.planExpiry == null ||
      (profile.planExpiry as Timestamp).toDate() > new Date());

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        loginWithGoogle,
        loginWithApple,
        logout,
        resetPassword,
        isAdmin,
        isStore,
        isPremium,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
