export function StatTile({
  label, value, sub, tone = "neutral",
}: { label: string; value: string; sub?: string; tone?: "neutral" | "leak" | "ok" | "warn" }) {
  const toneCls =
    tone === "leak" ? "text-leak" : tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "text-white";
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wider text-white/50">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${toneCls}`}>{value}</div>
      {sub && <div className="mt-1 text-sm text-white/60">{sub}</div>}
    </div>
  );
}
