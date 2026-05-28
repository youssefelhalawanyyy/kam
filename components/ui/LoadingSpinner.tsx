"use client";
import React from "react";
import { motion } from "framer-motion";

interface Props {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function LoadingSpinner({ size = "md", text }: Props) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizes[size]} border-3 border-emerald-200 border-t-emerald-500 rounded-full`}
        style={{ borderWidth: 3 }}
      />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
}
