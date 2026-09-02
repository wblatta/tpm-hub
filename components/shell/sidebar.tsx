"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Inbox as InboxIcon,
  LayoutDashboard,
  Plug,
  SquareStack,
  Users,
} from "lucide-react";
import { usePending } from "@/lib/store";
import { getIntegrations, getPrograms, getStakeholders } from "@/lib/data";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  count?: number;
  accent?: boolean;
};

export function Sidebar() {
  const pathname = usePathname();
  const pending = usePending();

  const here = (href: string) => {
    const p = (pathname || "/").replace(/\/+$/, "") || "/";
    return href === "/" ? p === "/" : p === href || p.startsWith(`${href}/`);
  };

  const main: Item[] = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inbox", label: "Inbox", icon: InboxIcon, count: pending.length, accent: true },
  ];
  const portfolio: Item[] = [
    { href: "/programs", label: "Programs", icon: SquareStack, count: getPrograms().length },
    { href: "/stakeholders", label: "Stakeholders", icon: Users, count: getStakeholders().length },
  ];
  const system: Item[] = [
    { href: "/agent-runs", label: "Agent runs", icon: Activity },
    { href: "/integrations", label: "Integrations", icon: Plug, count: getIntegrations().length },
  ];

  const render = (items: Item[]) =>
    items.map((it) => {
      const Icon = it.icon;
      const active = here(it.href);
      return (
        <Link
          key={it.href}
          href={it.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "mb-px flex items-center gap-2 rounded-md px-[7px] py-1.5 text-xs transition-colors",
            active ? "bg-hov font-medium text-tx" : "text-tx3 hover:bg-hov hover:text-tx2",
          )}
        >
          <Icon size={13} strokeWidth={1.9} className="shrink-0" />
          <span className="truncate">{it.label}</span>
          {typeof it.count === "number" && it.count > 0 ? (
            <span
              className={cn(
                "ml-auto rounded px-[5px] py-px text-[9.5px] tabular-nums",
                it.accent ? "text-yel" : "bg-chip text-tx3",
              )}
              style={
                it.accent
                  ? { background: "color-mix(in srgb, var(--yel) 16%, transparent)" }
                  : undefined
              }
            >
              {it.count}
            </span>
          ) : null}
        </Link>
      );
    });

  return (
    <aside className="flex w-[196px] shrink-0 flex-col border-r border-line bg-side px-[9px] py-3">
      <div className="mb-3 flex items-center gap-2 rounded-md px-[7px] py-[5px]">
        <span
          className="size-5 shrink-0 rounded-md"
          style={{
            background: "linear-gradient(135deg, var(--vio), var(--ind))",
            boxShadow: "0 2px 10px var(--wash)",
          }}
        />
        <span className="text-[12.5px] font-semibold tracking-[-0.25px]">TPM Hub</span>
      </div>

      {render(main)}

      <div className="mt-3 mb-1.5 px-[7px] text-[8.5px] uppercase tracking-[1.15px] text-tx4">
        Portfolio
      </div>
      {render(portfolio)}

      <div className="mt-3 mb-1.5 px-[7px] text-[8.5px] uppercase tracking-[1.15px] text-tx4">
        System
      </div>
      {render(system)}

      <div className="mt-auto flex items-center gap-2 border-t border-line pt-2.5">
        <span
          className="flex size-[21px] items-center justify-center rounded-full text-[8.5px] font-bold text-white"
          style={{ background: "linear-gradient(135deg,#4C6EF5,#22B8CF)" }}
        >
          WL
        </span>
        <span className="text-[11px] text-tx2">W. Latta</span>
      </div>
    </aside>
  );
}
