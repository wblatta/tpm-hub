"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { getPrograms } from "@/lib/data";
import { useDemo } from "@/lib/store";
import { cn } from "@/lib/utils";

type Cmd = { id: string; label: string; hint: string; run: () => void };

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const resetDemo = useDemo((s) => s.resetDemo);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Cmd[]>(() => {
    const nav: Cmd[] = [
      { id: "n-dash", label: "Dashboard", hint: "Go", run: () => router.push("/") },
      { id: "n-inbox", label: "Inbox", hint: "Go", run: () => router.push("/inbox") },
      { id: "n-programs", label: "Programs", hint: "Go", run: () => router.push("/programs") },
      { id: "n-stake", label: "Stakeholders", hint: "Go", run: () => router.push("/stakeholders") },
      { id: "n-runs", label: "Agent runs", hint: "Go", run: () => router.push("/agent-runs") },
      { id: "n-int", label: "Integrations", hint: "Go", run: () => router.push("/integrations") },
    ];
    const progs: Cmd[] = getPrograms().map((p) => ({
      id: `p-${p.key}`,
      label: `${p.key} · ${p.name}`,
      hint: "Program",
      run: () => router.push(`/programs/${p.key.toLowerCase()}`),
    }));
    const actions: Cmd[] = [
      {
        id: "a-theme",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        hint: "Action",
        run: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      { id: "a-reset", label: "Reset demo state", hint: "Action", run: () => resetDemo() },
    ];
    return [...nav, ...progs, ...actions];
  }, [router, theme, setTheme, resetDemo]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const hit = results[cursor];
        if (hit) {
          hit.run();
          onOpenChange(false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, cursor, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[14vh] backdrop-blur-[2px]"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-[min(560px,92vw)] overflow-hidden rounded-xl border border-line bg-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Jump to a page, a program, or run an action…"
          className="w-full border-b border-line bg-transparent px-4 py-3.5 text-[13px] text-tx outline-none placeholder:text-tx4"
        />
        <ul className="max-h-[52vh] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-[12px] text-tx4">No matches</li>
          ) : (
            results.map((c, i) => (
              <li key={c.id}>
                <button
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => {
                    c.run();
                    onOpenChange(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px] transition-colors",
                    i === cursor ? "bg-hov text-tx" : "text-tx2",
                  )}
                >
                  <span className="truncate">{c.label}</span>
                  <span className="ml-auto shrink-0 text-[9.5px] uppercase tracking-wider text-tx4">
                    {c.hint}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
