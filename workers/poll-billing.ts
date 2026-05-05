// Cloudflare Worker — daily billing poll (mocked).
// Deploy with `wrangler deploy` after setting env vars.
// Cron trigger in wrangler.toml: "0 6 * * *" (06:00 UTC daily).

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  AWS_BILLING_URL?: string; // optional; falls back to mock
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(run(env));
  },
  async fetch(_req: Request, env: Env) {
    await run(env);
    return new Response("ok");
  },
};

async function run(env: Env) {
  const items = env.AWS_BILLING_URL ? await fetchReal(env.AWS_BILLING_URL) : mockBilling();
  await upsertLineItems(env, items);
}

async function fetchReal(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`billing fetch ${r.status}`);
  return await r.json();
}

function mockBilling() {
  // Minimal mirror of mockData.ts — Worker-side is intentionally independent.
  return [
    { resource_id: "vol-0a1b2c3d4", kind: "ebs_volume", name: "gamma-train-gpu-01-data",
      cost_usd: 142, daily_cost_usd: 4.7, utilization: 0, attached: false, last_used_days: 14,
      region: "us-west-2", provider: "aws", workspace_id: "project-gamma" },
    { resource_id: "alb-gamma-staging-3", kind: "load_balancer", name: "gamma-staging-3-alb",
      cost_usd: 168, daily_cost_usd: 7.0, utilization: 0, attached: true, last_used_days: 21,
      region: "us-west-2", provider: "aws", workspace_id: "project-gamma" },
  ];
}

async function upsertLineItems(env: Env, items: any[]) {
  const url = `${env.SUPABASE_URL}/rest/v1/line_items`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(items),
  });
  if (!r.ok) throw new Error(`supabase upsert ${r.status}: ${await r.text()}`);
}
