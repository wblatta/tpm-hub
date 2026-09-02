"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import type { Brief } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { compactNumber, usd } from "@/lib/utils";
import { Ago, Btn, RichText, SourceChip, SourceList, TodayLabel } from "@/components/ui/primitives";

/**
 * The Morning Brief. The only element in the app carrying the violet treatment,
 * so violet reads as "this is model output" rather than decoration.
 */
export function BriefTile({ brief }: { brief: Brief }) {
  const items = useDemo((s) => s.items);
  const approve = useDemo((s) => s.approve);
  const [showSources, setShowSources] = useState(false);

  // The brief's publishable artifact is the weekly status draft sitting in the inbox.
  const linked = items.find((i) => i.agentRunId === brief.agentRunId);
  const published = linked?.status === "approved";

  const allSources = brief.paragraphs.flatMap((p) => p.sources);

  return (
    <section className="tile tile-hover hero-mesh col-span-full flex flex-col p-[14px_15px] lg:col-span-4 lg:row-span-2">
      <div className="mb-3 flex items-center gap-2.5">
        <span
          className="flex size-[26px] items-center justify-center rounded-lg text-white"
          style={{
            background: "linear-gradient(135deg, var(--vio2), var(--ind))",
            boxShadow: "0 3px 16px var(--wash)",
          }}
        >
          <Sparkles size={13} strokeWidth={2.2} />
        </span>
        <h2 className="text-base font-semibold tracking-[-0.45px]">Morning Brief</h2>
        <span className="ml-auto text-[10.5px] text-tx4">
          <TodayLabel />
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {brief.paragraphs.map((p, i) => (
          <p key={i} className="text-[13.5px] leading-[1.68] text-tx2">
            <RichText text={p.text} />
            <SourceChip count={p.sources.length} />
          </p>
        ))}
      </div>

      {showSources ? (
        <div className="mt-3 rounded-lg border border-line bg-panel/60 p-3">
          <div className="lab mb-2">
            Provenance · {allSources.length} records across 5 sources
          </div>
          <SourceList sources={allSources} />
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3.5">
        {published ? (
          <span className="flex items-center gap-1.5 rounded-lg bg-chip px-3.5 py-[7px] text-[11.5px] font-medium text-grn">
            <Check size={13} strokeWidth={2.5} /> Published to {linked?.destination}
          </span>
        ) : (
          <Btn variant="violet" onClick={() => linked && approve(linked.id)} disabled={!linked}>
            Approve &amp; publish
          </Btn>
        )}
        <Btn onClick={() => setShowSources((v) => !v)}>
          {showSources ? "Hide sources" : "Show sources"}
        </Btn>
        <span className="ml-auto text-[9.5px] tabular-nums text-tx4">
          <Ago minutes={brief.generatedAgoMinutes} /> · {compactNumber(brief.tokens)} tok ·{" "}
          {usd(brief.costUsd)}
        </span>
      </div>
    </section>
  );
}
