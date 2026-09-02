/**
 * Repository layer.
 *
 * Every read in the app goes through here. The signatures are deliberately
 * query-shaped so that replacing the fixture imports with `better-sqlite3`
 * statements is contained to this directory and changes no callers.
 */

import {
  achievements,
  actionItems,
  activity,
  decisions,
  programs,
  risks,
} from "../fixtures/programs";
import {
  agentRuns,
  brief,
  inboxItems,
  integrations,
  spendCapUsd,
  stakeholders,
} from "../fixtures/operations";
import type {
  Achievement,
  ActionItem,
  ActivityEntry,
  AgentRun,
  Brief,
  Decision,
  InboxItem,
  Integration,
  Program,
  Risk,
  Stakeholder,
} from "../types";

export function getPrograms(): Program[] {
  return programs;
}

export function getProgram(key: string): Program | undefined {
  return programs.find((p) => p.key.toLowerCase() === key.toLowerCase());
}

export function getProgramById(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}

export function getRisks(programId?: string): Risk[] {
  const rows = programId ? risks.filter((r) => r.programId === programId) : risks;
  const rank = { high: 0, medium: 1, low: 2 } as const;
  return [...rows].sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export function getOpenRisks(programId?: string): Risk[] {
  return getRisks(programId).filter((r) => r.status !== "closed");
}

export function getDecisions(programId?: string): Decision[] {
  const rows = programId ? decisions.filter((d) => d.programId === programId) : decisions;
  return [...rows].sort((a, b) => a.decidedAgoDays - b.decidedAgoDays);
}

export function getAchievements(programId?: string): Achievement[] {
  const rows = programId ? achievements.filter((a) => a.programId === programId) : achievements;
  return [...rows].sort((a, b) => a.agoDays - b.agoDays);
}

export function getActionItems(programId?: string): ActionItem[] {
  const rows = programId ? actionItems.filter((a) => a.programId === programId) : actionItems;
  return [...rows].sort((a, b) => a.dueInDays - b.dueInDays);
}

export function getActivity(programId?: string): ActivityEntry[] {
  const rows = programId ? activity.filter((a) => a.programId === programId) : activity;
  return [...rows].sort((a, b) => a.agoMinutes - b.agoMinutes);
}

export function getInboxItems(): InboxItem[] {
  return [...inboxItems].sort((a, b) => a.agoMinutes - b.agoMinutes);
}

export function getAgentRuns(): AgentRun[] {
  return [...agentRuns].sort((a, b) => a.agoMinutes - b.agoMinutes);
}

export function getStakeholders(): Stakeholder[] {
  return [...stakeholders].sort((a, b) => a.name.localeCompare(b.name));
}

export function getIntegrations(): Integration[] {
  return integrations;
}

export function getBrief(): Brief {
  return brief;
}

export function getSpendCap(): number {
  return spendCapUsd;
}

/** Derived portfolio numbers, computed rather than hard-coded so nothing drifts. */
export function getPortfolioStats() {
  const all = getPrograms();
  const openRisks = getOpenRisks();
  const runs = getAgentRuns();
  const weekRuns = runs.filter((r) => r.agoMinutes <= 7 * 24 * 60);

  return {
    programCount: all.length,
    onTrack: all.filter((p) => p.status === "green").length,
    atRisk: all.filter((p) => p.status === "amber").length,
    blocked: all.filter((p) => p.status === "red").length,
    openRiskCount: openRisks.length,
    highRiskCount: openRisks.filter((r) => r.severity === "high").length,
    risksOpenedThisWeek: openRisks.filter((r) => r.openedAgoDays <= 7).length,
    runCount: weekRuns.length,
    failureCount: weekRuns.filter((r) => r.status === "error").length,
    spendUsd: weekRuns.reduce((sum, r) => sum + r.costUsd, 0),
    spendCapUsd,
  };
}

/** Count risks per program id. Pure helper, kept beside the queries that feed it. */
export function riskCountsByProgram(rows: Risk[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.programId] = (acc[r.programId] ?? 0) + 1;
    return acc;
  }, {});
}
