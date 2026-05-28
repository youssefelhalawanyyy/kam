"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";

interface Props {
  url: string;
  store: string;
  productName: string;
  children: React.ReactNode;
  className?: string;
}

export default function AffiliateLinkWrapper({ url, store, productName, children, className }: Props) {
  const { user } = useAuth();

  const affiliateUrl = `/api/affiliate/click?url=${encodeURIComponent(url)}&store=${encodeURIComponent(store)}&product=${encodeURIComponent(productName)}${user ? `&uid=${user.uid}` : ""}`;

  return (
    <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
