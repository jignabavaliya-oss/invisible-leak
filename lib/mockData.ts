import type { LineItem, Workspace } from "./types";

export const WORKSPACES: Workspace[] = [
  { id: "production", name: "Production", description: "Customer-facing services", budget_usd: 18000 },
  { id: "project-gamma", name: "Project Gamma", description: "New ML pipeline", budget_usd: 6000 },
  { id: "staging", name: "Staging", description: "Pre-prod environments", budget_usd: 3000 },
  { id: "data-platform", name: "Data Platform", description: "Warehouse + ETL", budget_usd: 9000 },
  { id: "unassigned", name: "Unassigned", description: "Resources without tags", budget_usd: 1500 },
];

const today = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};

export const LINE_ITEMS: LineItem[] = [
  // Production — mostly healthy
  { id: "li-1", resource_id: "i-prod-web-01", kind: "ec2", name: "prod-web-01",
    workspace: "production", cost_usd: 612, daily_cost_usd: 24, utilization: 0.74,
    attached: true, last_used_days: 0, created_at: daysAgo(180), region: "us-east-1", provider: "aws" },
  { id: "li-2", resource_id: "i-prod-web-02", kind: "ec2", name: "prod-web-02",
    workspace: "production", cost_usd: 612, daily_cost_usd: 24, utilization: 0.71,
    attached: true, last_used_days: 0, created_at: daysAgo(180), region: "us-east-1", provider: "aws" },
  { id: "li-3", resource_id: "db-prod-01", kind: "rds", name: "prod-db-01",
    workspace: "production", cost_usd: 1840, daily_cost_usd: 72, utilization: 0.62,
    attached: true, last_used_days: 0, created_at: daysAgo(420), region: "us-east-1", provider: "aws" },
  { id: "li-4", resource_id: "alb-prod-edge", kind: "load_balancer", name: "prod-edge-alb",
    workspace: "production", cost_usd: 184, daily_cost_usd: 7.2, utilization: 0.55,
    attached: true, last_used_days: 0, created_at: daysAgo(300), region: "us-east-1", provider: "aws" },

  // Project Gamma — leaks!
  { id: "li-5", resource_id: "i-gamma-train-01", kind: "ec2", name: "gamma-train-gpu-01",
    workspace: "project-gamma", cost_usd: 2240, daily_cost_usd: 88, utilization: 0.34,
    attached: true, last_used_days: 0, created_at: daysAgo(45), region: "us-west-2", provider: "aws" },
  { id: "li-6", resource_id: "vol-0a1b2c3d4", kind: "ebs_volume", name: "gamma-train-gpu-01-data",
    workspace: "project-gamma", cost_usd: 142, daily_cost_usd: 4.7, utilization: 0,
    attached: false, last_used_days: 14, created_at: daysAgo(60), region: "us-west-2", provider: "aws" },
  { id: "li-7", resource_id: "alb-gamma-staging-3", kind: "load_balancer", name: "gamma-staging-3-alb",
    workspace: "project-gamma", cost_usd: 168, daily_cost_usd: 7.0, utilization: 0,
    attached: true, last_used_days: 21, created_at: daysAgo(28), region: "us-west-2", provider: "aws" },
  { id: "li-8", resource_id: "snap-9f8e7d6c", kind: "snapshot", name: "gamma-bootstrap-img-v2",
    workspace: "project-gamma", cost_usd: 64, daily_cost_usd: 2.1, utilization: 0,
    attached: false, last_used_days: 92, created_at: daysAgo(110), region: "us-west-2", provider: "aws" },

  // Staging — over budget, lots of ephemeral envs
  { id: "li-9", resource_id: "i-stg-pr-1042", kind: "ec2", name: "stg-pr-1042",
    workspace: "staging", cost_usd: 188, daily_cost_usd: 8, utilization: 0.05,
    attached: true, last_used_days: 9, created_at: daysAgo(11), region: "us-east-1", provider: "aws" },
  { id: "li-10", resource_id: "i-stg-pr-1051", kind: "ec2", name: "stg-pr-1051",
    workspace: "staging", cost_usd: 168, daily_cost_usd: 8, utilization: 0.02,
    attached: true, last_used_days: 7, created_at: daysAgo(7), region: "us-east-1", provider: "aws" },
  { id: "li-11", resource_id: "i-stg-pr-1058", kind: "ec2", name: "stg-pr-1058",
    workspace: "staging", cost_usd: 96, daily_cost_usd: 8, utilization: 0.01,
    attached: true, last_used_days: 4, created_at: daysAgo(4), region: "us-east-1", provider: "aws" },

  // Data Platform
  { id: "li-12", resource_id: "rds-warehouse", kind: "rds", name: "dw-warehouse-prod",
    workspace: "data-platform", cost_usd: 3120, daily_cost_usd: 124, utilization: 0.81,
    attached: true, last_used_days: 0, created_at: daysAgo(540), region: "us-east-1", provider: "aws" },
  { id: "li-13", resource_id: "lambda-etl-orchestrator", kind: "lambda", name: "etl-orchestrator",
    workspace: "data-platform", cost_usd: 84, daily_cost_usd: 3.4, utilization: 0.66,
    attached: true, last_used_days: 0, created_at: daysAgo(220), region: "us-east-1", provider: "aws" },
  { id: "li-14", resource_id: "vol-7e6d5c4b", kind: "ebs_volume", name: "dw-archive-old",
    workspace: "data-platform", cost_usd: 71, daily_cost_usd: 2.4, utilization: 0,
    attached: false, last_used_days: 45, created_at: daysAgo(200), region: "us-east-1", provider: "aws" },

  // Unassigned (no workspace tag — AI must infer)
  { id: "li-15", resource_id: "i-orphan-build-77", kind: "ec2", name: "build-runner-77",
    cost_usd: 412, daily_cost_usd: 16, utilization: 0.08,
    attached: true, last_used_days: 0, created_at: daysAgo(60), region: "us-east-1", provider: "aws" },
  { id: "li-16", resource_id: "vol-orphan-aa11", kind: "ebs_volume", name: "old-mysql-backup",
    cost_usd: 38, daily_cost_usd: 1.3, utilization: 0,
    attached: false, last_used_days: 180, created_at: daysAgo(360), region: "us-east-1", provider: "aws" },

  // SaaS seats
  { id: "li-17", resource_id: "saas-figma-seat-22", kind: "saas_seat", name: "Figma — j.former@co",
    workspace: "production", cost_usd: 45, daily_cost_usd: 1.5, utilization: 0,
    attached: true, last_used_days: 84, created_at: daysAgo(400), region: "global", provider: "saas" },
  { id: "li-18", resource_id: "saas-datadog-seat-9", kind: "saas_seat", name: "Datadog — m.intern@co",
    workspace: "data-platform", cost_usd: 31, daily_cost_usd: 1.0, utilization: 0,
    attached: true, last_used_days: 41, created_at: daysAgo(120), region: "global", provider: "saas" },
];

// Mock GitHub velocity per workspace (PRs merged in last 14 days)
export const VELOCITY: Record<string, { prs_14d: number; deploys_14d: number }> = {
  production: { prs_14d: 22, deploys_14d: 14 },
  "project-gamma": { prs_14d: 41, deploys_14d: 38 },
  staging: { prs_14d: 0, deploys_14d: 31 },
  "data-platform": { prs_14d: 9, deploys_14d: 6 },
  unassigned: { prs_14d: 3, deploys_14d: 2 },
};
