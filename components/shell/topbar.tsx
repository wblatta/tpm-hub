"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, RotateCcw, Sun } from "lucide-react";
import { getIntegrations, getProgram } from "@/lib/data";
import { useDemo, useSpend, useWeekRuns } from "@/lib/store";
import { ago, usd } from "@/lib/utils";
import { CommandPalette } from "./command-palette";

const TITLES: Record<string, [string, string]> = {
  "/": ["Home", "Dashboard"],
  "/inbox": ["Home", "Inbox"],
  "/programs": ["Portfolio", "Programs"],
  "/stakeholders": ["Portfolio", "Stakeholders"],
  "/agent-runs": ["System", "Agent runs"],
  "/integrations": ["System", "Integrations"],
};

function useCrumb(): [string, string] {
  const pathname = (usePathname() || "/").replace(/\/+$/, "") || "/";
  if (TITLES[pathname]) return TITLES[pathname];
  const m = pathname.match(/^\/programs\/([^/]+)$/);
  if (m) {
    const p = getProgram(m[1]);
    return ["Programs", p ? `${p.key} · ${p.name}` : m[1].toUpperCase()];
  }
  return ["Home", "Dashboard"];
}

export function Topbar() {
  const [parent, current] = useCrumb();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const resetDemo = useDemo((s) => s.resetDemo);
  const spend = useSpend();
  const runs = useWeekRuns();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const oldestSync = Math.min(...getIntegrations().map((i) => i.lastSyncAgoMinutes));
  const hasError = getIntegrations().some((i) => i.status === "error");

  return (
    <>
      <header className="flex h-[42px] shrink-0 items-center gap-2.5 border-b border-line px-[15px]">
        <div className="truncate text-xs font-medium tracking-[-0.1px]">
          <span className="font-normal text-tx4">{parent} / </span>
          {current}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span
            className="hidden items-center gap-1.5 rounded-md border border-line px-2 py-[3.5px] text-[10.5px] text-tx3 sm:flex"
            title={
              hasError
                ? "One source needs reconnecting — see Integrations"
                : "All sources syncing normally"
            }
          >
            <span
              className="size-[5px] rounded-full"
              style={{
                background: hasError ? "var(--yel)" : "var(--grn)",
                boxShadow: `0 0 7px ${hasError ? "var(--yel)" : "var(--grn)"}`,
              }}
            />
            {hasError ? "1 source needs attention" : "All sources synced"} · {ago(oldestSync)}
          </span>

          <span
            className="hidden items-center gap-1.5 rounded-md border border-line px-2 py-[3.5px] text-[10.5px] tabular-nums text-tx3 lg:flex"
            title="Agent spend over the last 7 days"
          >
            {runs.length} runs · {usd(spend)}
          </span>

          <button
            onClick={() => resetDemo()}
            title="Reset demo state"
            aria-label="Reset demo state"
            className="cursor-pointer rounded-md border border-line p-[5px] text-tx4 transition-colors hover:text-tx2"
          >
            <RotateCcw size={12} strokeWidth={2} />
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
            aria-label="Toggle theme"
            className="cursor-pointer rounded-md border border-line p-[5px] text-tx4 transition-colors hover:text-tx2"
          >
            {mounted && theme === "light" ? (
              <Sun size={12} strokeWidth={2} />
            ) : (
              <Moon size={12} strokeWidth={2} />
            )}
          </button>

          <button
            onClick={() => setPaletteOpen(true)}
            className="cursor-pointer rounded-md border border-line px-[7px] py-[3px] text-[10px] text-tx4 transition-colors hover:text-tx2"
            aria-label="Open command palette"
          >
            ⌘K
          </button>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
