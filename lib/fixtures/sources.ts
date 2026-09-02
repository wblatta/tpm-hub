import type { Provider, SourceRef } from "../types";

/** Terse constructor so fixture files stay readable. */
export function src(
  provider: Provider,
  type: SourceRef["type"],
  externalId: string,
  label: string,
  agoMinutes: number,
): SourceRef {
  return { provider, type, externalId, label, url: "#", agoMinutes };
}

export const S = {
  slackPlayback: (ago: number) =>
    src("slack", "thread", "#playback-eng", "Thread in #playback-eng", ago),
  slackPartner: (ago: number) =>
    src("slack", "thread", "#partner-sdk", "Thread in #partner-sdk", ago),
  slackEncoding: (ago: number) =>
    src("slack", "thread", "#encoding-platform", "Thread in #encoding-platform", ago),
  slackStudio: (ago: number) =>
    src("slack", "thread", "#studio-tools", "Thread in #studio-tools", ago),
  jira: (key: string, label: string, ago: number) => src("jira", "issue", key, label, ago),
  gcal: (label: string, ago: number) => src("gcal", "event", "cal-evt", label, ago),
  conf: (label: string, ago: number) => src("confluence", "page", "conf-page", label, ago),
  gh: (num: string, label: string, ago: number) => src("github", "pr", num, label, ago),
};
