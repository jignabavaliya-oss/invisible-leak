export type ResourceKind =
  | "ec2"
  | "rds"
  | "ebs_volume"
  | "load_balancer"
  | "snapshot"
  | "s3_bucket"
  | "lambda"
  | "saas_seat";

export interface LineItem {
  id: string;
  resource_id: string;
  kind: ResourceKind;
  name: string;
  workspace?: string;        // explicit tag (may be missing)
  inferred_workspace?: string; // AI-inferred bucket
  cost_usd: number;          // for the period (month-to-date)
  daily_cost_usd: number;
  utilization: number;       // 0..1, where 0 = idle
  attached: boolean;         // for volumes / LBs
  last_used_days: number;    // days since last use (for SaaS, snapshots)
  created_at: string;        // ISO date
  region: string;
  provider: "aws" | "gcp" | "saas";
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  budget_usd: number;
}

export interface AIInsight {
  workspace_id: string;
  summary: string;
  generated_at: string;
}
