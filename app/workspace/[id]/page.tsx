import Link from "next/link";
import { notFound } from "next/navigation";
import { summarize } from "@/lib/leakDetection";
import { forecastWorkspace } from "@/lib/forecast";
import { StatTile } from "@/components/StatTile";
import { LeakTable } from "@/components/LeakTable";
import { Explainer } from "@/components/Explainer";

export default function WorkspaceDetail({ params }: { params: { id: string } }) {
  const ws = summarize().find((w) => w.workspace.id === params.id);
  if (!ws) return notFound();
  const forecast = forecastWorkspace(ws);

  return (
    <main>
      <Link href="/" className="text-sm text-white/50 hover:text-white">← Dashboard</Link>
      <header className="mt-3 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{ws.workspace.name}</h1>
          <p className="text-white/55">{ws.workspace.description}</p>
        </div>
        {ws.leak_count > 0 ? (
          <span className="badge badge-leak">⚠ {ws.leak_count} leaks · ${ws.leak_amount.toFixed(0)}/mo</span>
        ) : (
          <span className="badge badge-ok">Healthy</span>
        )}
      </header>

      <section className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="MTD spend" value={`$${ws.spend_mtd.toLocaleString()}`} sub={`${ws.budget_pct}% of budget`} />
        <StatTile label="Daily burn" value={`$${ws.daily_burn.toLocaleString()}`} />
        <StatTile
          label="Forecast EOM"
          value={`$${forecast.end_of_month_usd.toLocaleString()}`}
          tone={forecast.end_of_month_usd > ws.budget_usd ? "leak" : "ok"}
          sub={forecast.notes}
        />
        <StatTile
          label="Efficiency"
          value={`${ws.efficiency}`}
          tone={ws.efficiency >= 85 ? "ok" : ws.efficiency >= 65 ? "warn" : "leak"}
          sub={`${ws.velocity.prs_14d} PRs · ${ws.velocity.deploys_14d} deploys (14d)`}
        />
      </section>

      <section className="mt-6">
        <Explainer workspaceId={ws.workspace.id} />
      </section>

      <section className="mt-6">
        <h2 className="text-sm uppercase tracking-wider text-white/50 mb-3">Detected leaks</h2>
        <LeakTable leaks={ws.leaks} />
      </section>

      <section className="mt-6">
        <h2 className="text-sm uppercase tracking-wider text-white/50 mb-3">All resources</h2>
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-black/20 text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">Resource</th>
                <th className="text-left p-3">Kind</th>
                <th className="text-left p-3">Tag</th>
                <th className="text-right p-3">Util</th>
                <th className="text-right p-3">$/day</th>
                <th className="text-right p-3">$ MTD</th>
              </tr>
            </thead>
            <tbody>
              {ws.items.map((i) => (
                <tr key={i.id} className="border-t border-line">
                  <td className="p-3">
                    <div className="font-medium">{i.name}</div>
                    <div className="text-xs text-white/40">{i.resource_id}</div>
                  </td>
                  <td className="p-3 text-white/70">{i.kind}</td>
                  <td className="p-3 text-white/70">
                    {i.workspace ? (
                      <span className="badge badge-ok">tagged</span>
                    ) : (
                      <span className="badge badge-warn">inferred</span>
                    )}
                  </td>
                  <td className="p-3 text-right">{Math.round(i.utilization * 100)}%</td>
                  <td className="p-3 text-right">${i.daily_cost_usd}</td>
                  <td className="p-3 text-right">${i.cost_usd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
