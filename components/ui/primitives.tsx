"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ago,
  cn,
  dateFromAgoDays,
  dateFromInDays,
  providerLabel,
  ragColor,
  severityColor,
  todayLabel,
} from "@/lib/utils";
import type { RagStatus, Severity, SourceRef } from "@/lib/types";

/* ------------------------------------------------------------------ dates --- */

/**
 * Absolute dates differ between build time and view time in a static export.
 * These render on the client and suppress the resulting hydration diff.
 *
 * Relative offsets (`ago`) don't need this — they're computed from a fixed
 * offset, not a wall-clock timestamp, so they're identical in both passes.
 */

export function TodayLabel() {
  const [label, setLabel] = useState(() => todayLabel());
  useEffect(() => setLabel(todayLabel()), []);
  return <span suppressHydrationWarning>{label}</span>;
}

export function DateOffset({ days, dir }: { days: number; dir: "ago" | "in" }) {
  const compute = () => (dir === "ago" ? dateFromAgoDays(days) : dateFromInDays(days));
  const [label, setLabel] = useState(compute);
  useEffect(() => setLabel(compute()), [days, dir]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span suppressHydrationWarning>{label}</span>;
}

export function Ago({ minutes }: { minutes: number }) {
  return <span>{ago(minutes)}</span>;
}

/* ----------------------------------------------------------------- layout --- */

export function Tile({
  className,
  children,
  hover = true,
  ...rest
}: {
  className?: string;
  children: ReactNode;
  hover?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("tile p-[14px_15px]", hover && "tile-hover", className)} {...rest}>
      {children}
    </div>
  );
}

export function Lab({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("lab", className)}>{children}</div>;
}

export function SectionHead({
  label,
  action,
}: {
  label: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-center">
      <Lab>{label}</Lab>
      {action ? <div className="ml-auto text-[10px] text-tx4">{action}</div> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- status --- */

export function RagDot({ status, size = 7 }: { status: RagStatus; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: ragColor[status] }}
      aria-hidden
    />
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className="rounded px-1.5 py-px text-[8.5px] font-semibold uppercase tracking-wider"
      style={{
        color: severityColor[severity],
        background: `color-mix(in srgb, ${severityColor[severity]} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${severityColor[severity]} 32%, transparent)`,
      }}
    >
      {severity}
    </span>
  );
}

export function ProgressBar({
  value,
  color,
  width = 60,
}: {
  value: number;
  color: string;
  width?: number | string;
}) {
  return (
    <span
      className="inline-block overflow-hidden rounded-full bg-rail"
      style={{ width, height: 4 }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span
        className="block h-full rounded-full"
        style={{ width: `${value}%`, background: color }}
      />
    </span>
  );
}

export function Confidence({ value }: { value: number }) {
  const low = value < 0.75;
  return (
    <span
      className="rounded px-1.5 py-px text-[9px] font-medium tabular-nums"
      style={{
        color: low ? "var(--yel)" : "var(--tx4)",
        background: low ? "color-mix(in srgb, var(--yel) 14%, transparent)" : "var(--chip)",
      }}
      title={low ? "Below the 0.75 auto-file threshold — needs review" : "Model confidence"}
    >
      {low ? "⚠ " : ""}
      {value.toFixed(2)}
    </span>
  );
}

/* --------------------------------------------------------------- sources --- */

/**
 * Provenance. Every model-generated artifact shows where it came from — this is
 * what makes the output auditable rather than merely plausible.
 */
export function SourceChip({ count }: { count: number }) {
  return (
    <span className="ml-1 inline-flex items-center gap-1 rounded border border-line px-1.5 align-[1.5px] text-[9px] text-tx4">
      ⬡ {count} source{count === 1 ? "" : "s"}
    </span>
  );
}

export function SourceList({ sources }: { sources: SourceRef[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {sources.map((s, i) => (
        <li key={`${s.externalId}-${i}`} className="flex items-center gap-2 text-[11px] text-tx3">
          <span className="w-[74px] shrink-0 text-[9px] uppercase tracking-wider text-tx4">
            {providerLabel[s.provider]}
          </span>
          <span className="truncate text-tx2">{s.label}</span>
          <span className="ml-auto shrink-0 font-mono text-[10px] text-tx4">{s.externalId}</span>
          <span className="w-[58px] shrink-0 text-right text-[10px] text-tx4">
            <Ago minutes={s.agoMinutes} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------------- buttons --- */

export function Btn({
  children,
  variant = "ghost",
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: "violet" | "ghost" | "outline";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "cursor-pointer rounded-lg px-3.5 py-[7px] text-[11.5px] font-medium transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40",
        variant === "violet" && "btn-violet",
        variant === "ghost" && "bg-chip text-tx3",
        variant === "outline" && "border border-line text-tx2",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Renders the brief's lightweight markup: __bold__ and ::amber:: status words. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(__[^_]+__|::[a-z]+::)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("__") && p.endsWith("__")) {
          return (
            <b key={i} className="font-semibold text-tx">
              {p.slice(2, -2)}
            </b>
          );
        }
        if (p.startsWith("::") && p.endsWith("::")) {
          const word = p.slice(2, -2);
          const color = word === "red" ? "var(--red)" : word === "green" ? "var(--grn)" : "var(--yel)";
          return (
            <b key={i} style={{ color }} className="font-semibold">
              {word}
            </b>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}
