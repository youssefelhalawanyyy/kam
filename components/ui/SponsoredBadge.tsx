export default function SponsoredBadge({ label = "Sponsored" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">
      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
      {label}
    </span>
  );
}
