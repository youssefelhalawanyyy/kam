"use client";
import Link from "next/link";
import { Lock, Zap } from "lucide-react";

interface Props {
  feature: string;
  limit?: string;
}

export default function UpgradePrompt({ feature, limit }: Props) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 text-center">
      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
        <Lock className="w-5 h-5 text-amber-600" />
      </div>
      <h3 className="font-bold text-slate-800 mb-1">{feature} — Premium Feature</h3>
      {limit && <p className="text-sm text-slate-500 mb-4">{limit}</p>}
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
      >
        <Zap className="w-4 h-4" />
        Upgrade to Premium
      </Link>
    </div>
  );
}
