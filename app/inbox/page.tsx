"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { InboxKind, InboxStatus } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { InboxRow } from "@/components/inbox/inbox-ui";
import { cn } from "@/lib/utils";

const KINDS: (InboxKind | "all")[] = ["all", "report", "risk", "extract", "reply", "agenda"];
const STATUSES: (InboxStatus | "all")[] = ["pending", "approved", "rejected", "all"];

export default function InboxPage() {
  const items = useDemo((s) => s.items);
  const [kind, setKind] = useState<InboxKind | "all">("all");
  const [status, setStatus] = useState<InboxStatus | "all">("pending");

  const filtered = items.filter(
    (i) => (kind === "all" || i.kind === kind) && (status === "all" || i.status === status),
  );

  const pill = (active: boolean) =>
    cn(
      "cursor-pointer rounded-md px-2.5 py-[5px] text-[11px] capitalize transition-colors",
      active ? "bg-chip text-tx" : "text-tx4 hover:text-tx2",
    );

  return (
    <div className="mx-auto max-w-[1100px] p-3.5">
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <h1 className="text-[15px] font-semibold tracking-[-0.3px]">Inbox</h1>
        <span className="flex items-center gap-1.5 rounded-md border border-line px-2 py-[3px] text-[10px] text-tx4">
          <ShieldCheck size={11} strokeWidth={2} />
          Human-in-the-loop gate — nothing reaches Slack, Jira, or Confluence without approval
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-0.5">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={pill(status === s)}>
              {s}
              {s !== "all" ? (
                <span className="ml-1.5 tabular-nums text-tx4">
                  {items.filter((i) => i.status === s).length}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <span className="h-4 w-px bg-line" />
        <div className="flex flex-wrap items-center gap-0.5">
          {KINDS.map((k) => (
            <button key={k} onClick={() => setKind(k)} className={pill(kind === k)}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="tile px-4 py-14 text-center">
          <div className="text-[13px] text-tx2">Nothing here</div>
          <div className="mt-1 text-[11px] text-tx4">
            No items match this filter. Reset demo state from the topbar to restore the queue.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((item) => (
            <InboxRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
