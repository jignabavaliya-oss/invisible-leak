import type { WorkspaceSummary } from "./leakDetection";

export interface Forecast {
  end_of_month_usd: number;
  baseline_usd: number;
  velocity_adjustment_usd: number;
  notes: string;
}

export function forecastWorkspace(ws: WorkspaceSummary): Forecast {
  const today = new Date();
  const dom = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const remaining = daysInMonth - dom;

  const baseline = ws.spend_mtd + ws.daily_burn * remaining;

  // Velocity uplift: high PR volume → more CI/CD + ephemeral envs
  // Heuristic: each PR over 20 in last 14d adds ~0.4% to remaining-period burn.
  const prSurplus = Math.max(0, ws.velocity.prs_14d - 20);
  const upliftPct = Math.min(0.35, prSurplus * 0.004);
  const velocity_adjustment = ws.daily_burn * remaining * upliftPct;

  return {
    end_of_month_usd: round(baseline + velocity_adjustment),
    baseline_usd: round(baseline),
    velocity_adjustment_usd: round(velocity_adjustment),
    notes:
      upliftPct > 0
        ? `Sprint velocity high (${ws.velocity.prs_14d} PRs / 14d): adding ${Math.round(upliftPct * 100)}% to remaining burn.`
        : "Sprint velocity nominal — no uplift applied.",
  };
}

function round(n: number) { return Math.round(n * 100) / 100; }
