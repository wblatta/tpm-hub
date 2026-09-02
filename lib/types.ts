/**
 * Domain types for TPM Hub.
 *
 * These mirror the shape the real tool stored in SQLite. Repository functions in
 * `lib/data` return these, so swapping fixtures for a real datastore is contained
 * to that directory.
 */

export type Provider = "slack" | "jira" | "gcal" | "confluence" | "github";

/**
 * Provenance primitive. Every model-generated artifact carries these, which is
 * what separates "the AI wrote a paragraph" from "the AI synthesized these records".
 */
export type SourceRef = {
  provider: Provider;
  type: "thread" | "issue" | "event" | "page" | "pr" | "commit" | "message";
  externalId: string;
  label: string;
  url: string;
  /** Minutes before "now". Resolved at mount so the demo never goes stale. */
  agoMinutes: number;
};

export type RagStatus = "green" | "amber" | "red";
export type Severity = "high" | "medium" | "low";

export type Program = {
  id: string;
  key: string;
  name: string;
  status: RagStatus;
  progress: number;
  owner: string;
  description: string;
  narrative: string;
  narrativeSources: SourceRef[];
  startedAgoDays: number;
  targetInDays: number;
  stakeholderIds: string[];
};

export type Risk = {
  id: string;
  programId: string;
  severity: Severity;
  title: string;
  description: string;
  owner: string;
  status: "open" | "mitigating" | "closed";
  openedAgoDays: number;
  sources: SourceRef[];
};

export type Decision = {
  id: string;
  programId: string;
  title: string;
  rationale: string;
  decidedBy: string;
  decidedAgoDays: number;
  sources: SourceRef[];
};

export type Achievement = {
  id: string;
  programId: string;
  title: string;
  agoDays: number;
  sources: SourceRef[];
};

export type ActionItem = {
  id: string;
  programId: string;
  title: string;
  owner: string;
  dueInDays: number;
  status: "open" | "done" | "blocked";
  /** 0–1. Anything under 0.7 is routed to the Inbox for review rather than auto-filed. */
  confidence: number;
  sources: SourceRef[];
};

export type ActivityEntry = {
  id: string;
  programId: string;
  kind: "published" | "synced" | "risk" | "decision" | "note";
  text: string;
  agoMinutes: number;
};

export type InboxKind = "report" | "risk" | "extract" | "reply" | "agenda";
export type InboxStatus = "pending" | "approved" | "rejected";

export type InboxItem = {
  id: string;
  kind: InboxKind;
  title: string;
  summary: string;
  /** The full draft the model produced, shown when the item is expanded. */
  payload: string;
  programId: string;
  agoMinutes: number;
  status: InboxStatus;
  agentRunId: string;
  confidence: number;
  sources: SourceRef[];
  /** Where this goes if approved, e.g. "Jira · PBT-1428". */
  destination: string;
  rejectionReason?: string;
};

export type RunStatus = "ok" | "warn" | "error";

export type AgentRun = {
  id: string;
  skill: string;
  model: "opus" | "sonnet" | "haiku" | "—";
  status: RunStatus;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  agoMinutes: number;
  durationMs: number;
  note?: string;
};

export type Stakeholder = {
  id: string;
  name: string;
  initials: string;
  role: string;
  org: string;
  programIds: string[];
  commsPrefs: string;
  lastInteractionAgoDays: number;
};

export type IntegrationStatus = "connected" | "error" | "not_configured";

export type Integration = {
  id: string;
  provider: Provider;
  label: string;
  status: IntegrationStatus;
  lastSyncAgoMinutes: number;
  recordCount: number;
  scopes: string[];
  detail: string;
  error?: string;
};

export type Brief = {
  dateLabel: string;
  paragraphs: { text: string; sources: SourceRef[] }[];
  agentRunId: string;
  generatedAgoMinutes: number;
  tokens: number;
  costUsd: number;
};
