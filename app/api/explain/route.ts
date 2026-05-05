import { NextResponse } from "next/server";
import { summarize } from "@/lib/leakDetection";
import { forecastWorkspace } from "@/lib/forecast";
import { explainSpend } from "@/lib/openrouter";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("workspace");
  if (!id) return NextResponse.json({ error: "workspace required" }, { status: 400 });
  const ws = summarize().find((w) => w.workspace.id === id);
  if (!ws) return NextResponse.json({ error: "not found" }, { status: 404 });
  const forecast = forecastWorkspace(ws);
  const summary = await explainSpend(ws, forecast);
  return NextResponse.json({
    workspace: ws.workspace.id,
    summary,
    forecast,
    leak_count: ws.leak_count,
    leak_amount: ws.leak_amount,
  });
}
