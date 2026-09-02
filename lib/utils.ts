import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Provider, RagStatus, Severity } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fixtures store time as offsets rather than absolute dates. Without this the demo
 * would claim "synced 2m ago" forever, then "synced 4 months ago" once the build
 * ages. Everything renders relative to whenever the page is actually opened.
 */
export function ago(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.round(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)}h ago`;
  const days = hours / 24;
  if (days < 7) return `${Math.round(days)}d ago`;
  const weeks = days / 7;
  if (weeks < 5) return `${Math.round(weeks)}w ago`;
  return `${Math.round(days / 30)}mo ago`;
}

export function inDays(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  if (days < 30) return `in ${days}d`;
  return `in ${Math.round(days / 30)}mo`;
}

export function dateFromAgoDays(days: number): string {
  const d = new Date(Date.now() - days * 86_400_000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function dateFromInDays(days: number): string {
  const d = new Date(Date.now() + days * 86_400_000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function usd(n: number): string {
  return `$${n.toFixed(n < 1 ? 3 : 2)}`;
}

export function compactNumber(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export const ragColor: Record<RagStatus, string> = {
  green: "var(--grn)",
  amber: "var(--yel)",
  red: "var(--red)",
};

export const ragLabel: Record<RagStatus, string> = {
  green: "On track",
  amber: "At risk",
  red: "Blocked",
};

export const severityColor: Record<Severity, string> = {
  high: "var(--red)",
  medium: "var(--yel)",
  low: "var(--tx4)",
};

export const providerLabel: Record<Provider, string> = {
  slack: "Slack",
  jira: "Jira",
  gcal: "Google Calendar",
  confluence: "Confluence",
  github: "GitHub",
};

/** Brand-ish accents, used sparingly for source chips and integration cards. */
export const providerColor: Record<Provider, string> = {
  slack: "#E01E5A",
  jira: "#2684FF",
  gcal: "#1A73E8",
  confluence: "#172B4D",
  github: "#8B949E",
};
