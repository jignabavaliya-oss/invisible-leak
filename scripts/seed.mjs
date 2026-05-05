// Seed Supabase with the demo dataset.
// Run: node scripts/seed.mjs
// Reads .env.local for NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_KEY.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
try {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local");
  process.exit(1);
}

async function rest(path, init = {}) {
  const r = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
      ...(init.headers || {}),
    },
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`${path} ${r.status}: ${text}`);
  }
  return r.status === 204 ? null : r.json().catch(() => null);
}

const today = new Date();
const daysAgo = (n) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n).toISOString();

const workspaces = [
  { id: "production", name: "Production", description: "Customer-facing services", budget_usd: 18000 },
  { id: "project-gamma", name: "Project Gamma", description: "New ML pipeline", budget_usd: 6000 },
  { id: "staging", name: "Staging", description: "Pre-prod environments", budget_usd: 3000 },
  { id: "data-platform", name: "Data Platform", description: "Warehouse + ETL", budget_usd: 9000 },
  { id: "unassigned", name: "Unassigned", description: "Resources without tags", budget_usd: 1500 },
];

const lineItems = [
  { resource_id: "i-prod-web-01", kind: "ec2", name: "prod-web-01", workspace_id: "production",
    cost_usd: 612, daily_cost_usd: 24, utilization: 0.74, attached: true, last_used_days: 0,
    region: "us-east-1", provider: "aws", created_at: daysAgo(180) },
  { resource_id: "i-prod-web-02", kind: "ec2", name: "prod-web-02", workspace_id: "production",
    cost_usd: 612, daily_cost_usd: 24, utilization: 0.71, attached: true, last_used_days: 0,
    region: "us-east-1", provider: "aws", created_at: daysAgo(180) },
  { resource_id: "db-prod-01", kind: "rds", name: "prod-db-01", workspace_id: "production",
    cost_usd: 1840, daily_cost_usd: 72, utilization: 0.62, attached: true, last_used_days: 0,
    region: "us-east-1", provider: "aws", created_at: daysAgo(420) },
  { resource_id: "alb-prod-edge", kind: "load_balancer", name: "prod-edge-alb", workspace_id: "production",
    cost_usd: 184, daily_cost_usd: 7.2, utilization: 0.55, attached: true, last_used_days: 0,
    region: "us-east-1", provider: "aws", created_at: daysAgo(300) },
  { resource_id: "i-gamma-train-01", kind: "ec2", name: "gamma-train-gpu-01", workspace_id: "project-gamma",
    cost_usd: 2240, daily_cost_usd: 88, utilization: 0.34, attached: true, last_used_days: 0,
    region: "us-west-2", provider: "aws", created_at: daysAgo(45) },
  { resource_id: "vol-0a1b2c3d4", kind: "ebs_volume", name: "gamma-train-gpu-01-data", workspace_id: "project-gamma",
    cost_usd: 142, daily_cost_usd: 4.7, utilization: 0, attached: false, last_used_days: 14,
    region: "us-west-2", provider: "aws", created_at: daysAgo(60) },
  { resource_id: "alb-gamma-staging-3", kind: "load_balancer", name: "gamma-staging-3-alb", workspace_id: "project-gamma",
    cost_usd: 168, daily_cost_usd: 7.0, utilization: 0, attached: true, last_used_days: 21,
    region: "us-west-2", provider: "aws", created_at: daysAgo(28) },
  { resource_id: "snap-9f8e7d6c", kind: "snapshot", name: "gamma-bootstrap-img-v2", workspace_id: "project-gamma",
    cost_usd: 64, daily_cost_usd: 2.1, utilization: 0, attached: false, last_used_days: 92,
    region: "us-west-2", provider: "aws", created_at: daysAgo(110) },
  { resource_id: "i-stg-pr-1042", kind: "ec2", name: "stg-pr-1042", workspace_id: "staging",
    cost_usd: 188, daily_cost_usd: 8, utilization: 0.05, attached: true, last_used_days: 9,
    region: "us-east-1", provider: "aws", created_at: daysAgo(11) },
  { resource_id: "i-stg-pr-1051", kind: "ec2", name: "stg-pr-1051", workspace_id: "staging",
    cost_usd: 168, daily_cost_usd: 8, utilization: 0.02, attached: true, last_used_days: 7,
    region: "us-east-1", provider: "aws", created_at: daysAgo(7) },
  { resource_id: "i-stg-pr-1058", kind: "ec2", name: "stg-pr-1058", workspace_id: "staging",
    cost_usd: 96, daily_cost_usd: 8, utilization: 0.01, attached: true, last_used_days: 4,
    region: "us-east-1", provider: "aws", created_at: daysAgo(4) },
  { resource_id: "rds-warehouse", kind: "rds", name: "dw-warehouse-prod", workspace_id: "data-platform",
    cost_usd: 3120, daily_cost_usd: 124, utilization: 0.81, attached: true, last_used_days: 0,
    region: "us-east-1", provider: "aws", created_at: daysAgo(540) },
  { resource_id: "lambda-etl-orchestrator", kind: "lambda", name: "etl-orchestrator", workspace_id: "data-platform",
    cost_usd: 84, daily_cost_usd: 3.4, utilization: 0.66, attached: true, last_used_days: 0,
    region: "us-east-1", provider: "aws", created_at: daysAgo(220) },
  { resource_id: "vol-7e6d5c4b", kind: "ebs_volume", name: "dw-archive-old", workspace_id: "data-platform",
    cost_usd: 71, daily_cost_usd: 2.4, utilization: 0, attached: false, last_used_days: 45,
    region: "us-east-1", provider: "aws", created_at: daysAgo(200) },
  { resource_id: "i-orphan-build-77", kind: "ec2", name: "build-runner-77", workspace_id: null,
    cost_usd: 412, daily_cost_usd: 16, utilization: 0.08, attached: true, last_used_days: 0,
    region: "us-east-1", provider: "aws", created_at: daysAgo(60) },
  { resource_id: "vol-orphan-aa11", kind: "ebs_volume", name: "old-mysql-backup", workspace_id: null,
    cost_usd: 38, daily_cost_usd: 1.3, utilization: 0, attached: false, last_used_days: 180,
    region: "us-east-1", provider: "aws", created_at: daysAgo(360) },
  { resource_id: "saas-figma-seat-22", kind: "saas_seat", name: "Figma — j.former@co", workspace_id: "production",
    cost_usd: 45, daily_cost_usd: 1.5, utilization: 0, attached: true, last_used_days: 84,
    region: "global", provider: "saas", created_at: daysAgo(400) },
  { resource_id: "saas-datadog-seat-9", kind: "saas_seat", name: "Datadog — m.intern@co", workspace_id: "data-platform",
    cost_usd: 31, daily_cost_usd: 1.0, utilization: 0, attached: true, last_used_days: 41,
    region: "global", provider: "saas", created_at: daysAgo(120) },
];

console.log("→ Clearing existing line_items + workspaces…");
await rest("line_items?id=neq.00000000-0000-0000-0000-000000000000", { method: "DELETE" });
await rest("workspaces?id=neq.__none__", { method: "DELETE" });

console.log(`→ Inserting ${workspaces.length} workspaces…`);
await rest("workspaces?on_conflict=id", { method: "POST", body: JSON.stringify(workspaces) });

console.log(`→ Inserting ${lineItems.length} line_items…`);
await rest("line_items", { method: "POST", body: JSON.stringify(lineItems) });

const verify = await rest("line_items?select=id");
console.log(`✓ Done. line_items in DB: ${Array.isArray(verify) ? verify.length : "?"}`);
