import { NextResponse } from "next/server";
import { summarize } from "@/lib/leakDetection";
import { forecastWorkspace } from "@/lib/forecast";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = (await summarize()).map((ws) => ({
    workspace: ws.workspace.id,
    name: ws.workspace.name,
    forecast: forecastWorkspace(ws),
    spend_mtd: ws.spend_mtd,
    budget_usd: ws.budget_usd,
  }));
  return NextResponse.json({ workspaces: data });
}
