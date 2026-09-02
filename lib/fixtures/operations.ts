import type { AgentRun, Brief, InboxItem, Integration, Stakeholder } from "../types";
import { S } from "./sources";

/* ---------------------------------------------------------------- Inbox --- */

export const inboxItems: InboxItem[] = [
  {
    id: "in-1",
    kind: "report",
    title: "Weekly status draft — Playback Telemetry v3",
    summary: "Ready to publish to the tracker. Flags the partner SDK dependency as the critical path.",
    payload:
      "**Playback Telemetry v3 — week of Sep 2**\n\n" +
      "Status: AMBER (was GREEN)\n\n" +
      "Shadow traffic is running at 12% of production volume with no measurable drift against v2. " +
      "Schema registry v3 validators merged Friday (#4471).\n\n" +
      "The program moved to amber this week for a single reason: partner SDK sign-off is now six days " +
      "past its committed date, and the Q4 cutover cannot be scheduled without it. This is an external " +
      "dependency on PSDK 4.0, which is itself blocked on legal review of revised partner terms.\n\n" +
      "Ask: help escalating PSDK-217 with legal. Everything else is on track.\n\n" +
      "Next week: ramp shadow traffic to 25%, file the change-freeze exception for the v2 decommission window.",
    programId: "p-pbt",
    agoMinutes: 2,
    status: "pending",
    agentRunId: "run-1",
    confidence: 0.93,
    sources: [
      S.slackPlayback(38),
      S.jira("PBT-1428", "Shadow traffic ramp to 25%", 190),
      S.gh("#4471", "feat: schema registry v3 validators", 420),
      S.conf("Playback Telemetry v3 — Cutover Plan", 1500),
    ],
    destination: "Jira · PBT-1428",
  },
  {
    id: "in-2",
    kind: "risk",
    title: "New risk flagged — Partner SDK dependency",
    summary: "Extracted from 3 chat threads. Proposed severity: high.",
    payload:
      "**Proposed risk**\n\n" +
      "Title: Partner SDK sign-off blocking Q4 cutover\n" +
      "Severity: HIGH\n" +
      "Program: Playback Telemetry v3\n" +
      "Suggested owner: D. Osei\n\n" +
      "Evidence: three separate threads in #partner-sdk over the last four days reference the sign-off " +
      "slipping, with no revised date committed. PSDK-217 (legal review) has had no activity in 14 days.\n\n" +
      "Transitive impact: this is also the root cause of PBT moving to amber.",
    programId: "p-pbt",
    agoMinutes: 18,
    status: "pending",
    agentRunId: "run-2",
    confidence: 0.87,
    sources: [S.slackPartner(52), S.slackPartner(900), S.jira("PSDK-217", "Legal review — partner terms 4.0", 2100)],
    destination: "Risk register · PBT",
  },
  {
    id: "in-3",
    kind: "extract",
    title: "4 action items from Platform Sync",
    summary: "Owners inferred from transcript. One item below the confidence threshold.",
    payload:
      "**Extracted from: Platform Sync — Tuesday**\n\n" +
      "1. Get a revised sign-off date from the partner SDK team — W. Latta — due tomorrow (0.94)\n" +
      "2. File a change-freeze exception for the v2 decommission window — P. Raman — due in 5d (0.88)\n" +
      "3. Implement schema registry rollback path — M. Chen — due in 12d (0.79)\n" +
      "4. Chase integration windows from the two unresponsive partners — D. Osei — due in 3d (0.72) ⚠\n\n" +
      "Item 4 is below the 0.75 auto-file threshold — the owner was inferred from a single ambiguous " +
      "mention and should be confirmed before filing.",
    programId: "p-pbt",
    agoMinutes: 63,
    status: "pending",
    agentRunId: "run-3",
    confidence: 0.72,
    sources: [S.gcal("Platform Sync — Tuesday", 70), S.slackPlayback(90)],
    destination: "Action items · PBT",
  },
  {
    id: "in-4",
    kind: "agenda",
    title: "Agenda draft — Partner SDK escalation",
    summary: "Approved and sent Monday.",
    payload:
      "**Partner SDK escalation — agenda**\n\n" +
      "1. State of PSDK-217 (5m)\n" +
      "2. What unblocks legal review this week (10m)\n" +
      "3. Revised sign-off commitment (10m)\n" +
      "4. Contingency: what PBT does if sign-off slips past Oct 1 (5m)",
    programId: "p-psdk",
    agoMinutes: 1520,
    status: "approved",
    agentRunId: "run-6",
    confidence: 0.9,
    sources: [S.gcal("Partner SDK escalation", 1600), S.slackPartner(2400)],
    destination: "Google Calendar",
  },
  {
    id: "in-5",
    kind: "reply",
    title: "Suggested reply in #encoding-platform",
    summary: "Rejected — tone did not match the channel.",
    payload:
      "Suggested reply:\n\n" +
      "\"Confirming the load test came back 18% above target — we're clear to proceed with the " +
      "scheduler decommission. I'll have the runbook handover scheduled by end of week.\"",
    programId: "p-epm",
    agoMinutes: 2900,
    status: "rejected",
    agentRunId: "run-8",
    confidence: 0.68,
    sources: [S.slackEncoding(3000)],
    destination: "Slack · #encoding-platform",
    rejectionReason: "Too formal for this channel, and the handover date wasn't mine to commit.",
  },
];

/* ----------------------------------------------------------- Agent runs --- */

const run = (
  id: string,
  skill: string,
  model: AgentRun["model"],
  status: AgentRun["status"],
  tokensIn: number,
  tokensOut: number,
  costUsd: number,
  agoMinutes: number,
  durationMs: number,
  note?: string,
): AgentRun => ({ id, skill, model, status, tokensIn, tokensOut, costUsd, agoMinutes, durationMs, note });

export const agentRuns: AgentRun[] = [
  run("run-1", "brief.generate", "sonnet", "ok", 10_890, 1_541, 0.061, 2, 4_820),
  run("run-2", "risk.extract", "sonnet", "warn", 7_410, 1_492, 0.044, 18, 3_110, "1 low-confidence result routed to inbox"),
  run("run-3", "actions.extract", "sonnet", "warn", 6_980, 1_233, 0.038, 63, 2_940, "1 of 4 items below 0.75 threshold"),
  run("run-4", "status.draft", "opus", "ok", 16_402, 2_822, 0.288, 91, 11_260),
  run("run-5", "sync.docs", "—", "error", 0, 0, 0, 93, 1_180, "Confluence auth expired — retried at 08:31"),
  run("run-6", "agenda.draft", "sonnet", "ok", 4_120, 902, 0.024, 1_520, 2_050),
  run("run-7", "program.summarize", "sonnet", "ok", 12_330, 2_104, 0.071, 1_610, 5_390),
  run("run-8", "reply.suggest", "haiku", "ok", 2_880, 410, 0.004, 2_900, 900),
  run("run-9", "risk.score", "sonnet", "ok", 5_640, 811, 0.031, 3_010, 2_240),
  run("run-10", "brief.generate", "sonnet", "ok", 10_220, 1_488, 0.058, 1_442, 4_610),
  run("run-11", "portfolio.rollup", "opus", "ok", 21_880, 3_940, 0.386, 2_880, 14_020),
  run("run-12", "actions.extract", "sonnet", "ok", 6_110, 1_042, 0.033, 4_320, 2_680),
  run("run-13", "brief.generate", "sonnet", "ok", 9_940, 1_402, 0.056, 2_882, 4_390),
  run("run-14", "decision.record", "sonnet", "ok", 3_980, 744, 0.023, 5_760, 1_820),
  run("run-15", "sync.slack", "—", "ok", 0, 0, 0, 38, 2_400),
  run("run-16", "sync.jira", "—", "ok", 0, 0, 0, 190, 3_180),
  run("run-17", "brief.generate", "sonnet", "ok", 10_010, 1_455, 0.057, 4_322, 4_500),
  run("run-18", "program.summarize", "sonnet", "ok", 11_780, 1_990, 0.068, 5_770, 5_040),
  run("run-19", "risk.extract", "sonnet", "ok", 7_020, 1_301, 0.041, 7_200, 3_020),
  run("run-20", "status.draft", "opus", "ok", 15_220, 2_610, 0.266, 8_640, 10_480),
];

/** Budget the demo displays against. */
export const spendCapUsd = 10;

/* --------------------------------------------------------- Stakeholders --- */

export const stakeholders: Stakeholder[] = [
  { id: "s-priya", name: "Priya Raman", initials: "PR", role: "Engineering Manager", org: "Playback Platform", programIds: ["p-pbt", "p-sas"], commsPrefs: "Prefers written updates in-channel; no status DMs", lastInteractionAgoDays: 0 },
  { id: "s-marcus", name: "Marcus Chen", initials: "MC", role: "Staff Engineer", org: "Playback Platform", programIds: ["p-pbt", "p-epm"], commsPrefs: "Wants technical detail, not summaries", lastInteractionAgoDays: 1 },
  { id: "s-dana", name: "Dana Osei", initials: "DO", role: "Partner Engineering Lead", org: "Partner Platform", programIds: ["p-pbt", "p-psdk"], commsPrefs: "Async only; timezone offset +8", lastInteractionAgoDays: 0 },
  { id: "s-tomas", name: "Tomas Ibarra", initials: "TI", role: "Product Manager", org: "Partner Platform", programIds: ["p-pbt", "p-psdk"], commsPrefs: "Weekly digest; escalate by phone if red", lastInteractionAgoDays: 3 },
  { id: "s-ines", name: "Ines Novak", initials: "IN", role: "Engineering Manager", org: "Studio Tools", programIds: ["p-epm", "p-sas"], commsPrefs: "Bullet points, no narrative prose", lastInteractionAgoDays: 2 },
  { id: "s-raj", name: "Raj Adeyemi", initials: "RA", role: "SRE Lead", org: "Encoding Platform", programIds: ["p-epm", "p-sas"], commsPrefs: "Page for anything customer-impacting", lastInteractionAgoDays: 4 },
  { id: "s-lena", name: "Lena Varga", initials: "LV", role: "Legal Counsel", org: "Legal", programIds: ["p-psdk"], commsPrefs: "Formal written requests only; 5-day SLA", lastInteractionAgoDays: 14 },
  { id: "s-kofi", name: "Kofi Mensah", initials: "KM", role: "Director, Program Management", org: "Platform Engineering", programIds: ["p-pbt", "p-epm", "p-psdk", "p-sas"], commsPrefs: "Portfolio rollup Mondays; exceptions immediately", lastInteractionAgoDays: 1 },
  { id: "s-yuki", name: "Yuki Tanaka", initials: "YT", role: "Data Engineer", org: "Playback Platform", programIds: ["p-pbt"], commsPrefs: "Prefers issue comments over chat", lastInteractionAgoDays: 6 },
  { id: "s-sam", name: "Sam Okonkwo", initials: "SO", role: "QA Lead", org: "Partner Platform", programIds: ["p-psdk"], commsPrefs: "Include repro steps in every handoff", lastInteractionAgoDays: 8 },
  { id: "s-elena", name: "Elena Ruiz", initials: "ER", role: "Technical Writer", org: "Developer Experience", programIds: ["p-psdk", "p-sas"], commsPrefs: "Needs 2 weeks lead time for docs", lastInteractionAgoDays: 11 },
  { id: "s-aditya", name: "Aditya Bose", initials: "AB", role: "Staff Engineer", org: "Encoding Platform", programIds: ["p-epm"], commsPrefs: "Direct and blunt; skip the preamble", lastInteractionAgoDays: 5 },
];

/* --------------------------------------------------------- Integrations --- */

export const integrations: Integration[] = [
  {
    id: "i-slack",
    provider: "slack",
    label: "Slack",
    status: "connected",
    lastSyncAgoMinutes: 2,
    recordCount: 18_442,
    scopes: ["channels:history", "channels:read", "users:read"],
    detail: "6 channels mapped to programs · read-only",
  },
  {
    id: "i-jira",
    provider: "jira",
    label: "Jira",
    status: "connected",
    lastSyncAgoMinutes: 5,
    recordCount: 1_284,
    scopes: ["read:jira-work", "read:jira-user"],
    detail: "4 projects · program config read from the epic record",
  },
  {
    id: "i-gcal",
    provider: "gcal",
    label: "Google Calendar",
    status: "connected",
    lastSyncAgoMinutes: 1,
    recordCount: 612,
    scopes: ["calendar.readonly", "calendar.events.readonly"],
    detail: "Transcripts auto-attached where available",
  },
  {
    id: "i-conf",
    provider: "confluence",
    label: "Confluence",
    status: "error",
    lastSyncAgoMinutes: 93,
    recordCount: 341,
    scopes: ["read:content:confluence"],
    detail: "3 spaces indexed",
    error: "Auth token expired — last successful sync 93m ago. Reconnect to resume.",
  },
  {
    id: "i-github",
    provider: "github",
    label: "GitHub",
    status: "connected",
    lastSyncAgoMinutes: 7,
    recordCount: 2_970,
    scopes: ["repo:status", "read:org"],
    detail: "5 repos · PRs and commits only, never writes",
  },
];

/* --------------------------------------------------------------- Brief --- */

export const brief: Brief = {
  dateLabel: "",
  paragraphs: [
    {
      text: "__Playback Telemetry v3__ slipped to ::amber::. Partner SDK sign-off is __6 days late__ and now sits on the critical path for the Q4 cutover.",
      sources: [
        S.slackPlayback(38),
        S.slackPartner(52),
        S.jira("PBT-1428", "Shadow traffic ramp to 25%", 190),
        S.conf("Playback Telemetry v3 — Cutover Plan", 1500),
      ],
    },
    {
      text: "__Encoding Pipeline Migration__ cleared its final gate on Friday — two risks closed, no open blockers.",
      sources: [
        S.slackEncoding(310),
        S.jira("EPM-903", "Load test results — 18% above target", 1400),
        S.conf("EPM Architecture Gate — Decision Record", 2800),
        S.gh("#4390", "feat: reconciliation worker", 2600),
        S.jira("EPM-871", "Failover drill — round 2", 4300),
        S.slackEncoding(5200),
        S.conf("EPM Runbook", 900),
      ],
    },
    {
      text: "__Partner SDK 4.0__ remains ::red:: — legal review of the revised terms has not started in 14 days. Unblocking it also unblocks PBT.",
      sources: [S.jira("PSDK-217", "Legal review — partner terms 4.0", 2100), S.slackPartner(900)],
    },
  ],
  agentRunId: "run-1",
  generatedAgoMinutes: 2,
  tokens: 12_431,
  costUsd: 0.061,
};
