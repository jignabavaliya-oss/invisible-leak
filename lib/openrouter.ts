import type { WorkspaceSummary } from "./leakDetection";
import type { Forecast } from "./forecast";

const MODEL = process.env.OPENROUTER_MODEL || "qwen/qwen-2.5-72b-instruct";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export async function explainSpend(ws: WorkspaceSummary, forecast: Forecast): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;

  const prompt = buildPrompt(ws, forecast);
  if (!key) return mockExplanation(ws, forecast);

  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://invisible-leak.local",
        "X-Title": "The Invisible Leak",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content:
              "You are a FinOps analyst. Explain cloud spend in 2–3 short sentences, citing specific resources and dollar amounts. Plain English, no markdown headings.\n\n" +
              prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 280,
      }),
    });
    if (!r.ok) {
      const body = await r.text().catch(() => "");
      console.warn(`[openrouter] ${r.status} ${body.slice(0, 200)}`);
      throw new Error(`OpenRouter ${r.status}`);
    }
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || mockExplanation(ws, forecast);
  } catch {
    return mockExplanation(ws, forecast);
  }
}

function buildPrompt(ws: WorkspaceSummary, forecast: Forecast): string {
  const topLeaks = ws.leaks
    .sort((a, b) => b.monthly_waste_usd - a.monthly_waste_usd)
    .slice(0, 4)
    .map((l) => `- ${l.item.name} (${l.reason}, $${l.monthly_waste_usd.toFixed(0)}/mo)`)
    .join("\n");
  return [
    `Workspace: ${ws.workspace.name}`,
    `Month-to-date spend: $${ws.spend_mtd}`,
    `Daily burn: $${ws.daily_burn}`,
    `Budget: $${ws.budget_usd} (${ws.budget_pct}% used)`,
    `Detected leaks: ${ws.leak_count} totaling $${ws.leak_amount}/mo`,
    `Forecast end-of-month: $${forecast.end_of_month_usd}`,
    `PRs merged (14d): ${ws.velocity.prs_14d}; deploys: ${ws.velocity.deploys_14d}`,
    "",
    "Top leaks:",
    topLeaks || "(none)",
    "",
    "Explain in 2–3 sentences why spend is what it is, what is wasted, and what to do.",
  ].join("\n");
}

function mockExplanation(ws: WorkspaceSummary, forecast: Forecast): string {
  const top = ws.leaks.sort((a, b) => b.monthly_waste_usd - a.monthly_waste_usd)[0];
  const overBudget = ws.budget_pct > 80;
  const fragments: string[] = [];
  fragments.push(
    `${ws.workspace.name} is at $${ws.spend_mtd} month-to-date (${ws.budget_pct}% of budget)${
      overBudget ? " and trending hot" : ""
    }, projected to land near $${forecast.end_of_month_usd} by month-end.`
  );
  if (top) {
    fragments.push(
      `The biggest leak is ${top.item.name} (${humanReason(top.reason)}), wasting roughly $${top.monthly_waste_usd.toFixed(
        0
      )}/month — resolving it alone recovers most of the slack.`
    );
  }
  if (ws.velocity.prs_14d > 25) {
    fragments.push(
      `High sprint velocity (${ws.velocity.prs_14d} PRs in 14 days) is inflating CI/CD and ephemeral env costs; expect a ${Math.round(
        (forecast.velocity_adjustment_usd / Math.max(forecast.baseline_usd, 1)) * 100
      )}% uplift over baseline.`
    );
  }
  return fragments.join(" ");
}

function humanReason(r: string) {
  const map: Record<string, string> = {
    unattached_volume: "unattached EBS volume",
    idle_load_balancer: "idle load balancer",
    old_snapshot: "stale snapshot",
    abandoned_saas_seat: "abandoned SaaS seat",
    low_utilization: "near-idle compute",
  };
  return map[r] ?? r;
}
