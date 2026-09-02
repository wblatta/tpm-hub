"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { usePending } from "@/lib/store";
import { InboxCardCompact } from "@/components/inbox/inbox-ui";
import { Lab } from "@/components/ui/primitives";

/**
 * The human-in-the-loop gate, deliberately the widest element on the dashboard:
 * nothing the model produces reaches another system without passing through here.
 */
export function InboxStrip() {
  const pending = usePending();

  return (
    <section className="tile tile-hover col-span-full p-[14px_15px]">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <Lab>Awaiting your approval</Lab>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-tx4">
          <ShieldCheck size={11} strokeWidth={2} />
          Nothing publishes without you
          <Link href="/inbox" className="inline-flex items-center gap-1 hover:text-tx2">
            · Open inbox <ArrowRight size={10} />
          </Link>
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center">
          <div className="text-[13px] text-tx2">Queue clear</div>
          <div className="mt-1 text-[11px] text-tx4">
            Everything the agent drafted has been reviewed. Use the reset control in the topbar to
            replay the demo.
          </div>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {pending.slice(0, 3).map((item) => (
            <InboxCardCompact key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
