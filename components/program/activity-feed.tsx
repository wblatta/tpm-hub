"use client";

import { useDemo } from "@/lib/store";
import { getActivity } from "@/lib/data";
import type { ActivityEntry } from "@/lib/types";
import { Ago } from "@/components/ui/primitives";

const KIND_COLOR: Record<ActivityEntry["kind"], string> = {
  published: "var(--vio2)",
  synced: "var(--tx4)",
  risk: "var(--red)",
  decision: "var(--ind)",
  note: "var(--grn)",
};

/**
 * Merges fixture activity with entries produced by approvals in this session, so
 * publishing from the Inbox visibly lands on the program it belongs to.
 */
export function ActivityFeed({ programId }: { programId: string }) {
  const published = useDemo((s) => s.publishedActivity);
  const entries = [...published.filter((e) => e.programId === programId), ...getActivity(programId)]
    .sort((a, b) => a.agoMinutes - b.agoMinutes)
    .slice(0, 10);

  return (
    <ul className="flex flex-col">
      {entries.map((e, i) => (
        <li
          key={e.id}
          className={`flex items-start gap-2.5 py-2 text-[11.5px] ${
            i < entries.length - 1 ? "border-b border-line2" : ""
          }`}
        >
          <span
            className="mt-[5px] size-[5px] shrink-0 rounded-full"
            style={{ background: KIND_COLOR[e.kind] }}
            aria-hidden
          />
          <span className="min-w-0 flex-1 text-tx2">{e.text}</span>
          <span className="shrink-0 text-[10px] text-tx4">
            <Ago minutes={e.agoMinutes} />
          </span>
        </li>
      ))}
    </ul>
  );
}
