"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Program } from "@/lib/types";
import { useSpend, useWeekRuns } from "@/lib/store";
import { cn, ragColor, ragLabel, usd } from "@/lib/utils";
import { Lab, ProgressBar, RagDot, SectionHead } from "@/components/ui/primitives";

/* ------------------------------------------------------------- spend tile --- */

/** The filled violet tile — what makes the grid read as bento rather than cards. */
export function SpendTile({ cap }: { cap: number }) {
  const spend = useSpend();
  const runs = useWeekRuns();
  const failures = runs.filter((r) => r.status === "error").length;
  const pct = Math.min(100, (spend / cap) * 100);

  return (
    <section className="tile tile-hover violet-fill relative col-span-full overflow-hidden p-[14px_15px] sm:col-span-3 lg:col-span-2">
      <span
        className="pointer-events-none absolute -top-14 -right-13 size-[150px] rounded-full"
        style={{ background: "rgb(255 255 255 / 0.13)" }}
        aria-hidden
      />
      <div className="lab" style={{ color: "rgb(255 255 255 / 0.72)" }}>
        Agent spend · 7 days
      </div>
      <div className="mt-2.5 mb-0.5 text-[40px] leading-none font-bold tracking-[-2.2px] tabular-nums">
        {usd(spend)}
      </div>
      <div className="text-[11px]" style={{ color: "rgb(255 255 255 / 0.8)" }}>
        of {usd(cap)} budget cap
      </div>
      <div
        className="my-3 h-[5px] overflow-hidden rounded-full"
        style={{ background: "rgb(255 255 255 / 0.24)" }}
      >
        <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
      </div>
      <div
        className="flex justify-between text-[10px] tabular-nums"
        style={{ color: "rgb(255 255 255 / 0.72)" }}
      >
        <span>{runs.length} runs</span>
        <span>
          {failures} failure{failures === 1 ? "" : "s"}
        </span>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- risk tile --- */

export function RiskTile({
  openCount,
  openedThisWeek,
  trend,
}: {
  openCount: number;
  openedThisWeek: number;
  trend: number[];
}) {
  const max = Math.max(...trend, 1);
  return (
    <section className="tile tile-hover col-span-full flex flex-col p-[14px_15px] sm:col-span-3 lg:col-span-2">
      <Lab>Open risks</Lab>
      <div
        className="mt-2 text-[40px] leading-none font-bold tracking-[-2.2px] tabular-nums"
        style={{ color: "var(--yel)" }}
      >
        {openCount}
      </div>
      <div className="mt-1.5 text-[10px]" style={{ color: "var(--red)" }}>
        ▲ {openedThisWeek} opened this week
      </div>
      <div className="mt-auto flex h-[34px] items-end gap-[3px] pt-3" aria-hidden>
        {trend.map((v, i) => {
          const hot = i >= trend.length - 2;
          return (
            <span
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${Math.max(12, (v / max) * 100)}%`,
                background: hot
                  ? "linear-gradient(180deg, var(--yel), color-mix(in srgb, var(--yel) 35%, transparent))"
                  : "var(--rail)",
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- programs tile --- */

export function ProgramsTile({
  programs,
  riskCounts,
}: {
  programs: Program[];
  riskCounts: Record<string, number>;
}) {
  return (
    <section className="tile tile-hover col-span-full p-[14px_15px] lg:col-span-4">
      <SectionHead
        label="Programs"
        action={
          <Link href="/programs" className="inline-flex items-center gap-1 hover:text-tx2">
            View all <ArrowRight size={10} />
          </Link>
        }
      />
      <ul>
        {programs.map((p, i) => (
          <li
            key={p.id}
            className={cn(
              "flex items-center gap-2.5 py-2 text-[12.5px]",
              i < programs.length - 1 && "border-b border-line2",
            )}
          >
            <RagDot status={p.status} />
            <Link href={`/programs/${p.key.toLowerCase()}`} className="truncate hover:underline">
              {p.name}
            </Link>
            <span className="ml-auto flex shrink-0 items-center gap-3 text-[10.5px] text-tx4">
              <span className="hidden sm:inline">
                {riskCounts[p.id] ?? 0} risk{(riskCounts[p.id] ?? 0) === 1 ? "" : "s"}
              </span>
              <ProgressBar value={p.progress} color={ragColor[p.status]} />
              <span className="w-8 text-right tabular-nums">{p.progress}%</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------ health tile --- */

export function HealthTile({ programs }: { programs: Program[] }) {
  const counts = {
    green: programs.filter((p) => p.status === "green").length,
    amber: programs.filter((p) => p.status === "amber").length,
    red: programs.filter((p) => p.status === "red").length,
  };
  const ordered = [...programs].sort((a, b) => {
    const rank = { green: 0, amber: 1, red: 2 };
    return rank[a.status] - rank[b.status];
  });

  return (
    <section className="tile tile-hover col-span-full flex flex-col p-[14px_15px] lg:col-span-2">
      <Lab>Portfolio health</Lab>
      <div className="my-3 flex gap-[3px]" aria-hidden>
        {ordered.map((p) => (
          <span
            key={p.id}
            title={`${p.name} — ${ragLabel[p.status]}`}
            className="h-[38px] flex-1 rounded-[5px]"
            style={{ background: ragColor[p.status] }}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-1 text-[10px] text-tx3">
        <li className="flex items-center gap-1.5">
          <RagDot status="green" size={6} /> {counts.green} on track
        </li>
        <li className="flex items-center gap-1.5">
          <RagDot status="amber" size={6} /> {counts.amber} at risk
        </li>
        <li className="flex items-center gap-1.5">
          <RagDot status="red" size={6} /> {counts.red} blocked
        </li>
      </ul>
    </section>
  );
}
