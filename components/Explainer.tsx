"use client";
import { useEffect, useState } from "react";

export function Explainer({ workspaceId }: { workspaceId: string }) {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/explain?workspace=${workspaceId}`, { cache: "no-store" });
      const data = await r.json();
      setText(data.summary || "");
    } catch (e: any) {
      setError(e?.message ?? "failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [workspaceId]);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-white/50">AI Explainer</span>
          <span className="badge badge-warn">Qwen via OpenRouter</span>
        </div>
        <button onClick={load} className="btn-ghost text-xs">↻ Regenerate</button>
      </div>
      <p className="mt-3 text-white/85 leading-relaxed">
        {loading ? "Analyzing spend…" : error ? `Error: ${error}` : text}
      </p>
    </div>
  );
}
