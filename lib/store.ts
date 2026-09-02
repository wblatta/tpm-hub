"use client";

import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { getAgentRuns, getInboxItems } from "./data";
import type { ActivityEntry, AgentRun, InboxItem } from "./types";

/**
 * Demo state.
 *
 * Everything mutable in the demo lives here: inbox dispositions, the agent runs
 * appended when the user approves something, and the activity entries that
 * publishing produces. A refresh — or the Reset control in the topbar — restores
 * the initial state so the approval moment can be replayed during a walkthrough.
 */

type DemoState = {
  items: InboxItem[];
  runs: AgentRun[];
  publishedActivity: ActivityEntry[];
  lastAction: { id: string; kind: "approved" | "rejected" } | null;

  approve: (id: string) => void;
  reject: (id: string, reason: string) => void;
  editPayload: (id: string, payload: string) => void;
  resetDemo: () => void;
};

const initialItems = () => getInboxItems().map((i) => ({ ...i }));
const initialRuns = () => getAgentRuns().map((r) => ({ ...r }));

/** Deterministic pseudo-metrics so an approval logs a plausible run without RNG. */
function runMetricsFor(item: InboxItem) {
  const base = item.payload.length + item.title.length;
  const tokensIn = 3_200 + (base % 2_600);
  const tokensOut = 480 + (base % 700);
  const costUsd = Number(((tokensIn * 3 + tokensOut * 15) / 1_000_000).toFixed(3));
  return { tokensIn, tokensOut, costUsd, durationMs: 1_400 + (base % 2_800) };
}

let publishSeq = 0;

export const useDemo = create<DemoState>((set) => ({
  items: initialItems(),
  runs: initialRuns(),
  publishedActivity: [],
  lastAction: null,

  approve: (id) =>
    set((state) => {
      const item = state.items.find((i) => i.id === id);
      if (!item || item.status !== "pending") return state;

      const m = runMetricsFor(item);
      publishSeq += 1;

      const run: AgentRun = {
        id: `run-pub-${publishSeq}`,
        skill: `${item.kind}.publish`,
        model: "sonnet",
        status: "ok",
        tokensIn: m.tokensIn,
        tokensOut: m.tokensOut,
        costUsd: m.costUsd,
        agoMinutes: 0,
        durationMs: m.durationMs,
        note: `Approved by user → ${item.destination}`,
      };

      const entry: ActivityEntry = {
        id: `ac-pub-${publishSeq}`,
        programId: item.programId,
        kind: "published",
        text: `${item.title} published to ${item.destination}`,
        agoMinutes: 0,
      };

      return {
        items: state.items.map((i) => (i.id === id ? { ...i, status: "approved" as const } : i)),
        runs: [run, ...state.runs],
        publishedActivity: [entry, ...state.publishedActivity],
        lastAction: { id, kind: "approved" },
      };
    }),

  reject: (id, reason) =>
    set((state) => {
      const item = state.items.find((i) => i.id === id);
      if (!item || item.status !== "pending") return state;

      publishSeq += 1;
      const run: AgentRun = {
        id: `run-rej-${publishSeq}`,
        skill: `${item.kind}.reject`,
        model: "—",
        status: "warn",
        tokensIn: 0,
        tokensOut: 0,
        costUsd: 0,
        agoMinutes: 0,
        durationMs: 0,
        note: `Rejected by user — ${reason || "no reason given"}`,
      };

      return {
        items: state.items.map((i) =>
          i.id === id ? { ...i, status: "rejected" as const, rejectionReason: reason } : i,
        ),
        runs: [run, ...state.runs],
        lastAction: { id, kind: "rejected" },
      };
    }),

  editPayload: (id, payload) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, payload } : i)),
    })),

  resetDemo: () => {
    publishSeq = 0;
    set({
      items: initialItems(),
      runs: initialRuns(),
      publishedActivity: [],
      lastAction: null,
    });
  },
}));

/* Selectors ----------------------------------------------------------------
 *
 * Derived selectors build a new array on every call, so they must be wrapped in
 * useShallow — otherwise useSyncExternalStore sees a fresh reference each render
 * and warns about an uncached snapshot. Exported as hooks so callers can't
 * accidentally pass the raw selector to useDemo.
 */

const WEEK_MINUTES = 7 * 24 * 60;

export const usePending = () =>
  useDemo(useShallow((s: DemoState) => s.items.filter((i) => i.status === "pending")));

export const useWeekRuns = () =>
  useDemo(useShallow((s: DemoState) => s.runs.filter((r) => r.agoMinutes <= WEEK_MINUTES)));

/** Returns a number, so it needs no shallow wrapper. */
export const useSpend = () =>
  useDemo((s: DemoState) =>
    s.runs
      .filter((r) => r.agoMinutes <= WEEK_MINUTES)
      .reduce((sum, r) => sum + r.costUsd, 0),
  );
