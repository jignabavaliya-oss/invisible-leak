import { summarize, totals } from "@/lib/leakDetection";
import { WorkspaceCard } from "@/components/WorkspaceCard";
import { StatTile } from "@/components/StatTile";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [t, wsAll] = await Promise.all([totals(), summarize()]);
  const ws = wsAll.sort((a, b) => b.leak_amount - a.leak_amount);

  return (
    <main>
      <header className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-leak animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">The Invisible Leak</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Cloud spend, explained.
          </h1>
          <p className="text-white/55 mt-1">
            Project-based AI analysis across {t.workspaces} workspaces.
          </p>
        </div>
        <div className="text-right text-xs text-white/50">
          <div>Live data · refreshed daily</div>
          <div className="mt-1">Press <span className="kbd">⌘K</span> to search resources</div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatTile label="Spend (MTD)" value={`$${t.total_spend.toLocaleString()}`} sub={`Daily burn ~$${t.total_daily.toLocaleString()}`} />
        <StatTile label="Invisible Leak" value={`$${t.total_leak.toLocaleString()}/mo`} tone="leak" sub="Recoverable with one-click resolve" />
        <StatTile label="Workspaces" value={`${t.workspaces}`} sub="Inferred from naming where untagged" />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ws.map((s) => <WorkspaceCard key={s.workspace.id} s={s} />)}
      </section>
    </main>
  );
}
