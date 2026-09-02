"use client";

import { useState } from "react";
import type { AgentRun } from "@/lib/types";
import { useWeekRuns } from "@/lib/store";
import { getSpendCap } from "@/lib/data";
import { ago, cn, compactNumber, usd } from "@/lib/utils";
import { Lab } from "@/components/ui/primitives";

const STATUS_COLOR: Record<AgentRun["status"], string> = {
  ok: "var(--grn)",
  warn: "var(--yel)",
  error: "var(--red)",
};
const STATUS_GLYPH: Record<AgentRun["status"], string> = { ok: "✓", warn: "⚠", error: "✗" };

export default function AgentRunsPage() {
  const runs = useWeekRuns();
  const [filter, setFilter] = useState<AgentRun["status"] | "all">("all");

  const shown = filter === "all" ? runs : runs.filter((r) => r.status === filter);

  const spend = runs.reduce((s, r) => s + r.costUsd, 0);
  const tokens = runs.reduce((s, r) => s + r.tokensIn + r.tokensOut, 0);
  const byModel = runs.reduce<Record<string, { runs: number; cost: number }>>((acc, r) => {
    const k = r.model;
    acc[k] = acc[k] ?? { runs: 0, cost: 0 };
    acc[k].runs += 1;
    acc[k].cost += r.costUsd;
    return acc;
  }, {});

  const stat = (label: string, value: string, color?: string) => (
    <div className="tile flex-1 p-[11px_13px]">
      <Lab>{label}</Lab>
      <div
        className="mt-1.5 text-[21px] leading-none font-semibold tracking-[-0.9px] tabular-nums"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1100px] p-3.5">
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <h1 className="text-[15px] font-semibold tracking-[-0.3px]">Agent runs</h1>
        <span className="text-[11px] text-tx4">
          Every model call is logged with its cost. Last 7 days.
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-3">
        {stat("Runs", String(runs.length))}
        {stat("Spend", usd(spend))}
        {stat("Budget cap", usd(getSpendCap()))}
        {stat("Tokens", compactNumber(tokens))}
        {stat(
          "Failures",
          String(runs.filter((r) => r.status === "error").length),
          runs.some((r) => r.status === "error") ? "var(--red)" : undefined,
        )}
      </div>

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div className="tile p-[14px_15px]">
          <Lab className="mb-2.5">Cost by model</Lab>
          <ul className="flex flex-col gap-2">
            {Object.entries(byModel)
              .sort((a, b) => b[1].cost - a[1].cost)
              .map(([model, v]) => (
                <li key={model} className="flex items-center gap-3 text-[11.5px]">
                  <span className="w-14 font-mono text-tx2">{model}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-rail">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${spend > 0 ? (v.cost / spend) * 100 : 0}%`,
                        background: "linear-gradient(90deg, var(--vio), var(--ind))",
                      }}
                    />
                  </span>
                  <span className="w-12 text-right tabular-nums text-tx3">{usd(v.cost)}</span>
                  <span className="w-14 text-right text-[10px] tabular-nums text-tx4">
                    {v.runs} runs
                  </span>
                </li>
              ))}
          </ul>
        </div>

        <div className="tile p-[14px_15px]">
          <Lab className="mb-2.5">Budget</Lab>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] leading-none font-semibold tracking-[-1.2px] tabular-nums">
              {usd(spend)}
            </span>
            <span className="text-[11px] text-tx4">of {usd(getSpendCap())}</span>
          </div>
          <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-rail">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (spend / getSpendCap()) * 100)}%`,
                background: "linear-gradient(90deg, var(--vio), var(--ind))",
              }}
            />
          </div>
          <p className="mt-3 text-[11px] leading-snug text-tx4">
            Runs halt automatically at the cap. Approving an item from the Inbox appends a run here
            with its own cost.
          </p>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-0.5">
        {(["all", "ok", "warn", "error"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "cursor-pointer rounded-md px-2.5 py-[5px] text-[11px] capitalize transition-colors",
              filter === f ? "bg-chip text-tx" : "text-tx4 hover:text-tx2",
            )}
          >
            {f}
            {f !== "all" ? (
              <span className="ml-1.5 tabular-nums text-tx4">
                {runs.filter((r) => r.status === f).length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="tile overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] font-mono text-[10.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[8.5px] tracking-[1.1px] uppercase text-tx4">
                <th className="px-4 py-2.5 font-normal">When</th>
                <th className="py-2.5 font-normal">Skill</th>
                <th className="py-2.5 font-normal">Model</th>
                <th className="py-2.5 text-right font-normal">Tokens</th>
                <th className="py-2.5 text-right font-normal">Duration</th>
                <th className="px-4 py-2.5 text-right font-normal">Cost</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={r.id} className={i < shown.length - 1 ? "border-b border-line2" : ""}>
                  <td className="px-4 py-2 whitespace-nowrap text-tx4">{ago(r.agoMinutes)}</td>
                  <td className="py-2 text-tx2">
                    <span style={{ color: STATUS_COLOR[r.status] }}>{STATUS_GLYPH[r.status]}</span>{" "}
                    {r.skill}
                    {r.note ? <span className="ml-2 text-tx4">· {r.note}</span> : null}
                  </td>
                  <td className="py-2">
                    <span className="rounded border border-line px-1.5 py-px text-[9px] text-tx4">
                      {r.model}
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums text-tx3">
                    {r.tokensIn + r.tokensOut > 0
                      ? (r.tokensIn + r.tokensOut).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-2 text-right tabular-nums text-tx4">
                    {r.durationMs > 0 ? `${(r.durationMs / 1000).toFixed(1)}s` : "—"}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-tx3">{usd(r.costUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
