"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, X } from "lucide-react";
import type { InboxItem, InboxKind } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { getProgramById } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Ago, Btn, Confidence, SourceList } from "@/components/ui/primitives";

const KIND_LABEL: Record<InboxKind, string> = {
  report: "REPORT",
  risk: "RISK",
  extract: "EXTRACT",
  reply: "REPLY",
  agenda: "AGENDA",
};

export function KindTag({ kind }: { kind: InboxKind }) {
  return (
    <span
      className="rounded-[5px] px-1.5 py-0.5 text-[8.5px] font-semibold tracking-wide"
      style={{ background: "var(--wash)", color: "var(--vio2)" }}
    >
      {KIND_LABEL[kind]}
    </span>
  );
}

export function StatusPill({ status }: { status: InboxItem["status"] }) {
  const map = {
    pending: { label: "Pending", color: "var(--yel)" },
    approved: { label: "Approved", color: "var(--grn)" },
    rejected: { label: "Rejected", color: "var(--red)" },
  } as const;
  const s = map[status];
  return (
    <span
      className="rounded px-1.5 py-px text-[9px] font-medium"
      style={{
        color: s.color,
        background: `color-mix(in srgb, ${s.color} 14%, transparent)`,
      }}
    >
      {s.label}
    </span>
  );
}

/* --------------------------------------------------- compact (dashboard) --- */

export function InboxCardCompact({ item }: { item: InboxItem }) {
  const approve = useDemo((s) => s.approve);
  const reject = useDemo((s) => s.reject);

  return (
    <div className="rounded-xl border border-line bg-panel2 p-[11px_12px]">
      <div className="text-xs leading-snug font-medium text-tx">{item.title}</div>
      <div className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-tx3">{item.summary}</div>
      <div className="mt-2.5 flex items-center gap-1.5">
        <KindTag kind={item.kind} />
        {item.status === "pending" ? (
          <>
            <button
              onClick={() => approve(item.id)}
              className="btn-violet cursor-pointer rounded-md px-2.5 py-1 text-[10px] font-medium transition-opacity hover:opacity-85"
            >
              Approve
            </button>
            <button
              onClick={() => reject(item.id, "Dismissed from dashboard")}
              className="cursor-pointer rounded-md bg-chip px-2.5 py-1 text-[10px] text-tx2 transition-opacity hover:opacity-85"
            >
              Reject
            </button>
          </>
        ) : (
          <StatusPill status={item.status} />
        )}
        <span className="ml-auto text-[9.5px] text-tx4">
          <Ago minutes={item.agoMinutes} />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- full (inbox page) --- */

export function InboxRow({ item }: { item: InboxItem }) {
  const approve = useDemo((s) => s.approve);
  const reject = useDemo((s) => s.reject);
  const editPayload = useDemo((s) => s.editPayload);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.payload);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const program = getProgramById(item.programId);
  const pending = item.status === "pending";

  return (
    <div
      className={cn(
        "tile overflow-hidden transition-opacity",
        !pending && "opacity-70",
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-start gap-3 p-[13px_15px] text-left"
      >
        <ChevronDown
          size={14}
          className={cn("mt-0.5 shrink-0 text-tx4 transition-transform", open && "rotate-180")}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-tx">{item.title}</span>
            <KindTag kind={item.kind} />
            {!pending ? <StatusPill status={item.status} /> : null}
            <Confidence value={item.confidence} />
          </div>
          <div className="mt-1 text-[11.5px] text-tx3">{item.summary}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-tx4">
            {program ? (
              <Link
                href={`/programs/${program.key.toLowerCase()}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-tx2 hover:underline"
              >
                {program.key} · {program.name}
              </Link>
            ) : null}
            <span>→ {item.destination}</span>
            <span>⬡ {item.sources.length} sources</span>
            <span>
              <Ago minutes={item.agoMinutes} />
            </span>
          </div>
        </div>
      </button>

      {open ? (
        <div className="border-t border-line px-[15px] py-3.5">
          <div className="lab mb-2">Draft</div>
          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={12}
              className="w-full resize-y rounded-lg border border-line bg-panel2 p-3 font-mono text-[11.5px] leading-relaxed text-tx2 outline-none focus:border-ind"
            />
          ) : (
            <pre className="max-h-[340px] overflow-y-auto rounded-lg border border-line bg-panel2 p-3 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-tx2">
              {item.payload}
            </pre>
          )}

          <div className="mt-3.5 rounded-lg border border-line bg-panel2 p-3">
            <div className="lab mb-2">Provenance · {item.sources.length} records</div>
            <SourceList sources={item.sources} />
          </div>

          {item.rejectionReason ? (
            <div className="mt-3 rounded-lg border border-line px-3 py-2 text-[11px] text-tx3">
              <span className="text-tx4">Rejected: </span>
              {item.rejectionReason}
            </div>
          ) : null}

          {pending ? (
            rejecting ? (
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <input
                  autoFocus
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are you rejecting this?"
                  className="min-w-[220px] flex-1 rounded-lg border border-line bg-panel2 px-3 py-2 text-[11.5px] text-tx outline-none focus:border-ind"
                />
                <Btn
                  variant="outline"
                  onClick={() => {
                    reject(item.id, reason);
                    setRejecting(false);
                  }}
                >
                  Confirm reject
                </Btn>
                <Btn onClick={() => setRejecting(false)}>Cancel</Btn>
              </div>
            ) : (
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <Btn
                  variant="violet"
                  onClick={() => {
                    if (editing) {
                      editPayload(item.id, draft);
                      setEditing(false);
                    }
                    approve(item.id);
                  }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Check size={13} strokeWidth={2.5} />
                    {editing ? "Save & approve" : "Approve"}
                  </span>
                </Btn>
                <Btn onClick={() => setEditing((v) => !v)}>{editing ? "Discard edits" : "Edit"}</Btn>
                <Btn onClick={() => setRejecting(true)}>
                  <span className="inline-flex items-center gap-1.5">
                    <X size={13} strokeWidth={2.5} /> Reject
                  </span>
                </Btn>
                <span className="ml-auto text-[10px] text-tx4">
                  Publishes to {item.destination}
                </span>
              </div>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
