import type { LineItem, Workspace } from "./types";
import { LINE_ITEMS, VELOCITY, WORKSPACES } from "./mockData";

export type LeakReason =
  | "unattached_volume"
  | "idle_load_balancer"
  | "old_snapshot"
  | "abandoned_saas_seat"
  | "low_utilization";

export interface Leak {
  item: LineItem;
  reason: LeakReason;
  monthly_waste_usd: number;
  remediation: string;
}

export function inferWorkspace(item: LineItem): string {
  if (item.workspace) return item.workspace;
  const n = item.name.toLowerCase();
  if (/^prod[-_]/.test(n) || n.includes("prod-")) return "production";
  if (n.startsWith("stg") || n.includes("staging")) return "staging";
  if (n.startsWith("gamma")) return "project-gamma";
  if (n.includes("dw-") || n.includes("etl") || n.includes("warehouse")) return "data-platform";
  if (n.includes("build") || n.includes("runner")) return "project-gamma";
  return "unassigned";
}

export function detectLeak(item: LineItem): Leak | null {
  const monthly = item.daily_cost_usd * 30;
  if (item.kind === "ebs_volume" && !item.attached) {
    return {
      item,
      reason: "unattached_volume",
      monthly_waste_usd: monthly,
      remediation: `aws ec2 delete-volume --volume-id ${item.resource_id} --region ${item.region}`,
    };
  }
  if (item.kind === "load_balancer" && item.utilization === 0) {
    return {
      item,
      reason: "idle_load_balancer",
      monthly_waste_usd: monthly,
      remediation: `aws elbv2 delete-load-balancer --load-balancer-arn arn:aws:elasticloadbalancing:${item.region}:000000000000:loadbalancer/app/${item.resource_id}`,
    };
  }
  if (item.kind === "snapshot" && item.last_used_days > 60) {
    return {
      item,
      reason: "old_snapshot",
      monthly_waste_usd: monthly,
      remediation: `aws ec2 delete-snapshot --snapshot-id ${item.resource_id} --region ${item.region}`,
    };
  }
  if (item.kind === "saas_seat" && item.last_used_days > 30) {
    return {
      item,
      reason: "abandoned_saas_seat",
      monthly_waste_usd: monthly,
      remediation: `# Revoke seat: ${item.name} (last login ${item.last_used_days}d ago)`,
    };
  }
  if (item.utilization < 0.1 && item.daily_cost_usd >= 5 && (item.kind === "ec2" || item.kind === "rds")) {
    return {
      item,
      reason: "low_utilization",
      monthly_waste_usd: monthly * 0.7,
      remediation: `aws ec2 stop-instances --instance-ids ${item.resource_id} --region ${item.region}`,
    };
  }
  return null;
}

export interface WorkspaceSummary {
  workspace: Workspace;
  spend_mtd: number;
  daily_burn: number;
  budget_usd: number;
  budget_pct: number;
  leak_count: number;
  leak_amount: number;
  efficiency: number; // 0..100
  items: LineItem[];
  leaks: Leak[];
  velocity: { prs_14d: number; deploys_14d: number };
}

export function summarize(): WorkspaceSummary[] {
  const enriched = LINE_ITEMS.map((i) => ({ ...i, inferred_workspace: inferWorkspace(i) }));
  return WORKSPACES.map((ws) => {
    const items = enriched.filter((i) => (i.workspace ?? i.inferred_workspace) === ws.id);
    const spend_mtd = round(items.reduce((s, i) => s + i.cost_usd, 0));
    const daily_burn = round(items.reduce((s, i) => s + i.daily_cost_usd, 0));
    const leaks = items.map(detectLeak).filter((x): x is Leak => !!x);
    const leak_amount = round(leaks.reduce((s, l) => s + l.monthly_waste_usd, 0));
    const efficiency = items.length === 0 ? 100 :
      Math.max(0, Math.round(100 - (leak_amount / Math.max(spend_mtd, 1)) * 100));
    return {
      workspace: ws,
      spend_mtd,
      daily_burn,
      budget_usd: ws.budget_usd,
      budget_pct: Math.round((spend_mtd / ws.budget_usd) * 100),
      leak_count: leaks.length,
      leak_amount,
      efficiency,
      items,
      leaks,
      velocity: VELOCITY[ws.id] ?? { prs_14d: 0, deploys_14d: 0 },
    };
  });
}

export function totals() {
  const s = summarize();
  return {
    total_spend: round(s.reduce((a, w) => a + w.spend_mtd, 0)),
    total_leak: round(s.reduce((a, w) => a + w.leak_amount, 0)),
    total_daily: round(s.reduce((a, w) => a + w.daily_burn, 0)),
    workspaces: s.length,
  };
}

function round(n: number) { return Math.round(n * 100) / 100; }
