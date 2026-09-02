import { AlertTriangle, Check, Lock } from "lucide-react";
import { getIntegrations } from "@/lib/data";
import { ago, providerColor } from "@/lib/utils";
import { Lab } from "@/components/ui/primitives";

const STATUS_META = {
  connected: { label: "Connected", color: "var(--grn)", Icon: Check },
  error: { label: "Needs attention", color: "var(--yel)", Icon: AlertTriangle },
  not_configured: { label: "Not configured", color: "var(--tx4)", Icon: Lock },
} as const;

export default function IntegrationsPage() {
  const integrations = getIntegrations();
  const connected = integrations.filter((i) => i.status === "connected").length;
  const totalRecords = integrations.reduce((s, i) => s + i.recordCount, 0);

  return (
    <div className="mx-auto max-w-[1100px] p-3.5">
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <h1 className="text-[15px] font-semibold tracking-[-0.3px]">Integrations</h1>
        <span className="text-[11px] text-tx4">
          {connected} of {integrations.length} connected · {totalRecords.toLocaleString()} records
          indexed locally
        </span>
      </div>

      <div className="tile mb-3 p-[14px_15px]">
        <Lab className="mb-2">Incremental adoption</Lab>
        <p className="max-w-[760px] text-[12.5px] leading-relaxed text-tx3">
          The tool is useful with zero integrations configured and gets more useful as sources are
          added — there is no all-or-nothing setup step. Every connector is pull-based and
          read-only; nothing is written back to a source system without an explicit approval in the
          Inbox.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {integrations.map((i) => {
          const meta = STATUS_META[i.status];
          const Icon = meta.Icon;
          return (
            <section key={i.id} className="tile tile-hover p-[14px_15px]">
              <div className="flex items-center gap-2.5">
                <span
                  className="size-[26px] shrink-0 rounded-lg"
                  style={{
                    background: `color-mix(in srgb, ${providerColor[i.provider]} 22%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${providerColor[i.provider]} 45%, transparent)`,
                  }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium">{i.label}</div>
                  <div className="truncate text-[10.5px] text-tx4">{i.detail}</div>
                </div>
                <span
                  className="ml-auto flex shrink-0 items-center gap-1.5 rounded-md px-2 py-[3px] text-[10px]"
                  style={{
                    color: meta.color,
                    background: `color-mix(in srgb, ${meta.color} 13%, transparent)`,
                  }}
                >
                  <Icon size={10} strokeWidth={2.5} />
                  {meta.label}
                </span>
              </div>

              {i.error ? (
                <p
                  className="mt-3 rounded-lg px-3 py-2 text-[11px] leading-snug"
                  style={{
                    color: "var(--yel)",
                    background: "color-mix(in srgb, var(--yel) 10%, transparent)",
                  }}
                >
                  {i.error}
                </p>
              ) : null}

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Lab>Last sync</Lab>
                  <div className="mt-1 text-[12px] text-tx2">{ago(i.lastSyncAgoMinutes)}</div>
                </div>
                <div>
                  <Lab>Records</Lab>
                  <div className="mt-1 text-[12px] tabular-nums text-tx2">
                    {i.recordCount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <Lab className="mb-1.5">Scopes</Lab>
                <ul className="flex flex-wrap gap-1.5">
                  {i.scopes.map((s) => (
                    <li
                      key={s}
                      className="rounded border border-line px-1.5 py-px font-mono text-[9.5px] text-tx4"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
