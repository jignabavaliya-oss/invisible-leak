import Link from "next/link";
import type { WorkspaceSummary } from "@/lib/leakDetection";

export function WorkspaceCard({ s }: { s: WorkspaceSummary }) {
  const overBudget = s.budget_pct > 90;
  const hot = s.leak_count >= 2 || s.leak_amount > 200 || overBudget;
  const efficiencyTone =
    s.efficiency >= 85 ? "text-ok" : s.efficiency >= 65 ? "text-warn" : "text-leak";

  return (
    <Link href={`/workspace/${s.workspace.id}`} className="card block group">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{s.workspace.name}</div>
          <div className="text-sm text-white/55">{s.workspace.description}</div>
        </div>
        {hot ? (
          <span className="badge badge-leak">⚠ Leak Detected</span>
        ) : (
          <span className="badge badge-ok">Healthy</span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div>
          <div className="text-[11px] uppercase text-white/40">MTD spend</div>
          <div className="text-xl font-semibold">${formatNum(s.spend_mtd)}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase text-white/40">Wasted /mo</div>
          <div className={`text-xl font-semibold ${s.leak_amount > 0 ? "text-leak" : "text-white/70"}`}>
            ${formatNum(s.leak_amount)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase text-white/40">Efficiency</div>
          <div className={`text-xl font-semibold ${efficiencyTone}`}>{s.efficiency}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>Budget</span>
          <span>${formatNum(s.spend_mtd)} / ${formatNum(s.budget_usd)}</span>
        </div>
        <div className="bar">
          <span
            style={{ width: `${Math.min(100, s.budget_pct)}%` }}
            className={overBudget ? "bg-leak" : s.budget_pct > 70 ? "bg-warn" : "bg-ok"}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/50">
        <span>{s.items.length} resources · {s.leak_count} flagged</span>
        <span className="opacity-0 group-hover:opacity-100 transition">Open →</span>
      </div>
    </Link>
  );
}

function formatNum(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
