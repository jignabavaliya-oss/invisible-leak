"use client";
import { Fragment, useState } from "react";
import type { Leak } from "@/lib/leakDetection";

const REASON_LABEL: Record<string, string> = {
  unattached_volume: "Unattached EBS volume",
  idle_load_balancer: "Idle load balancer",
  old_snapshot: "Old snapshot",
  abandoned_saas_seat: "Abandoned SaaS seat",
  low_utilization: "Near-idle compute",
};

export function LeakTable({ leaks }: { leaks: Leak[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  if (leaks.length === 0) {
    return <div className="card text-white/60">No leaks detected. Clean workspace ✨</div>;
  }

  return (
    <div className="card p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-black/20 text-white/50 text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left p-3">Resource</th>
            <th className="text-left p-3">Reason</th>
            <th className="text-right p-3">Wasted /mo</th>
            <th className="text-right p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {leaks
            .sort((a, b) => b.monthly_waste_usd - a.monthly_waste_usd)
            .map((l) => {
              const isOpen = open === l.item.id;
              const isResolved = resolved.has(l.item.id);
              return (
                <Fragment key={l.item.id}>
                  <tr className="border-t border-line">
                    <td className="p-3">
                      <div className="font-medium">{l.item.name}</div>
                      <div className="text-xs text-white/45">{l.item.resource_id} · {l.item.region}</div>
                    </td>
                    <td className="p-3">
                      <span className="badge badge-leak">{REASON_LABEL[l.reason]}</span>
                    </td>
                    <td className="p-3 text-right text-leak font-semibold">
                      ${l.monthly_waste_usd.toFixed(0)}
                    </td>
                    <td className="p-3 text-right">
                      {isResolved ? (
                        <span className="badge badge-ok">Queued</span>
                      ) : (
                        <button
                          onClick={() => setOpen(isOpen ? null : l.item.id)}
                          className="btn-ghost"
                        >
                          {isOpen ? "Hide" : "Resolve with AI"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-t border-line bg-black/30">
                      <td colSpan={4} className="p-4">
                        <div className="text-xs text-white/50 mb-2">Suggested CLI</div>
                        <pre className="text-xs bg-black/50 border border-line rounded-lg p-3 overflow-x-auto">
{l.remediation}
                        </pre>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="btn"
                            onClick={() => {
                              setResolved((s) => new Set(s).add(l.item.id));
                              setOpen(null);
                            }}
                          >
                            Queue for resolution
                          </button>
                          <button
                            className="btn-ghost"
                            onClick={() => navigator.clipboard.writeText(l.remediation)}
                          >
                            Copy command
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
