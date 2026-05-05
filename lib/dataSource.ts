import type { LineItem, Workspace } from "./types";
import { LINE_ITEMS, WORKSPACES, VELOCITY } from "./mockData";
import { isSupabaseConfigured, sbSelect } from "./supabase";

interface DBLineItem {
  id: string;
  resource_id: string;
  kind: string;
  name: string;
  workspace_id: string | null;
  inferred_workspace: string | null;
  cost_usd: number;
  daily_cost_usd: number;
  utilization: number;
  attached: boolean;
  last_used_days: number;
  region: string | null;
  provider: string | null;
  created_at: string;
}

interface DBWorkspace {
  id: string;
  name: string;
  description: string | null;
  budget_usd: number;
  created_at: string;
}

export async function loadWorkspaces(): Promise<Workspace[]> {
  if (!isSupabaseConfigured()) return WORKSPACES;
  try {
    const rows = await sbSelect<DBWorkspace>("workspaces", "select=*");
    if (!rows.length) return WORKSPACES;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? undefined,
      budget_usd: Number(r.budget_usd),
    }));
  } catch (e) {
    console.warn("[dataSource] workspaces fallback to mock:", (e as Error).message);
    return WORKSPACES;
  }
}

export async function loadLineItems(): Promise<LineItem[]> {
  if (!isSupabaseConfigured()) return LINE_ITEMS;
  try {
    const rows = await sbSelect<DBLineItem>("line_items", "select=*");
    if (!rows.length) return LINE_ITEMS;
    return rows.map((r) => ({
      id: r.id,
      resource_id: r.resource_id,
      kind: r.kind as LineItem["kind"],
      name: r.name,
      workspace: r.workspace_id ?? undefined,
      inferred_workspace: r.inferred_workspace ?? undefined,
      cost_usd: Number(r.cost_usd),
      daily_cost_usd: Number(r.daily_cost_usd),
      utilization: Number(r.utilization),
      attached: r.attached,
      last_used_days: r.last_used_days,
      created_at: r.created_at,
      region: r.region ?? "unknown",
      provider: (r.provider as LineItem["provider"]) ?? "aws",
    }));
  } catch (e) {
    console.warn("[dataSource] line_items fallback to mock:", (e as Error).message);
    return LINE_ITEMS;
  }
}

export function loadVelocity() {
  return VELOCITY;
}
