import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAchievements,
  getActionItems,
  getDecisions,
  getProgram,
  getPrograms,
  getRisks,
  getStakeholders,
} from "@/lib/data";
import { inDays, ragColor, ragLabel } from "@/lib/utils";
import {
  Confidence,
  DateOffset,
  Lab,
  ProgressBar,
  RagDot,
  SeverityBadge,
  SourceList,
} from "@/components/ui/primitives";
import { ActivityFeed } from "@/components/program/activity-feed";

export function generateStaticParams() {
  return getPrograms().map((p) => ({ key: p.key.toLowerCase() }));
}

export default async function ProgramPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const program = getProgram(key);
  if (!program) notFound();

  const risks = getRisks(program.id);
  const openRisks = risks.filter((r) => r.status !== "closed");
  const decisions = getDecisions(program.id);
  const achievements = getAchievements(program.id);
  const actions = getActionItems(program.id);
  const people = getStakeholders().filter((s) => program.stakeholderIds.includes(s.id));

  return (
    <div className="mx-auto max-w-[1100px] p-3.5">
      {/* Header ------------------------------------------------------------ */}
      <div className="mb-3.5">
        <Link href="/programs" className="text-[11px] text-tx4 hover:text-tx2">
          ← Programs
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-[11px] text-tx4">{program.key}</span>
          <h1 className="text-[17px] font-semibold tracking-[-0.4px]">{program.name}</h1>
          <span
            className="flex items-center gap-1.5 rounded-md px-2 py-[3px] text-[11px]"
            style={{
              color: ragColor[program.status],
              background: `color-mix(in srgb, ${ragColor[program.status]} 12%, transparent)`,
            }}
          >
            <RagDot status={program.status} size={6} />
            {ragLabel[program.status]}
          </span>
        </div>
        <p className="mt-2 max-w-[760px] text-[12.5px] leading-relaxed text-tx3">
          {program.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-tx4">
          <span>Owner · {program.owner}</span>
          <span>
            Started · <DateOffset days={program.startedAgoDays} dir="ago" />
          </span>
          <span>
            Target · <DateOffset days={program.targetInDays} dir="in" />
          </span>
          <span className="flex items-center gap-2">
            <ProgressBar value={program.progress} color={ragColor[program.status]} width={90} />
            <span className="tabular-nums">{program.progress}%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Left column --------------------------------------------------- */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          {/* Narrative */}
          <section className="tile hero-mesh p-[14px_15px]">
            <Lab className="mb-2">Status narrative · generated</Lab>
            <p className="text-[13px] leading-[1.7] text-tx2">{program.narrative}</p>
            <div className="mt-3 border-t border-line pt-3">
              <Lab className="mb-2">
                Provenance · {program.narrativeSources.length} records
              </Lab>
              <SourceList sources={program.narrativeSources} />
            </div>
          </section>

          {/* Risk register */}
          <section className="tile p-[14px_15px]">
            <div className="mb-2.5 flex items-center">
              <Lab>Risk register</Lab>
              <span className="ml-auto text-[10px] text-tx4">
                {openRisks.length} open · {risks.length - openRisks.length} closed
              </span>
            </div>
            {risks.length === 0 ? (
              <p className="py-4 text-center text-[11.5px] text-tx4">No risks recorded.</p>
            ) : (
              <ul className="flex flex-col">
                {risks.map((r, i) => (
                  <li
                    key={r.id}
                    className={i < risks.length - 1 ? "border-b border-line2 py-2.5" : "pt-2.5"}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={r.severity} />
                      <span
                        className={`text-[12.5px] font-medium ${
                          r.status === "closed" ? "text-tx4 line-through" : "text-tx"
                        }`}
                      >
                        {r.title}
                      </span>
                      <span className="ml-auto text-[10px] text-tx4">
                        {r.owner} · opened <DateOffset days={r.openedAgoDays} dir="ago" />
                      </span>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-snug text-tx3">{r.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Action items */}
          <section className="tile p-[14px_15px]">
            <Lab className="mb-2.5">Action items</Lab>
            <ul className="flex flex-col">
              {actions.map((a, i) => (
                <li
                  key={a.id}
                  className={`flex flex-wrap items-center gap-2 py-2 text-[12px] ${
                    i < actions.length - 1 ? "border-b border-line2" : ""
                  }`}
                >
                  <span
                    className="size-[5px] shrink-0 rounded-full"
                    style={{
                      background:
                        a.status === "done"
                          ? "var(--grn)"
                          : a.status === "blocked"
                            ? "var(--red)"
                            : "var(--tx4)",
                    }}
                    aria-hidden
                  />
                  <span className={a.status === "done" ? "text-tx4 line-through" : "text-tx2"}>
                    {a.title}
                  </span>
                  <Confidence value={a.confidence} />
                  <span className="ml-auto flex shrink-0 items-center gap-3 text-[10px] text-tx4">
                    <span>{a.owner}</span>
                    <span
                      style={{ color: a.dueInDays < 0 ? "var(--red)" : undefined }}
                      className="w-[74px] text-right"
                    >
                      {inDays(a.dueInDays)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right column -------------------------------------------------- */}
        <div className="flex flex-col gap-3">
          <section className="tile p-[14px_15px]">
            <Lab className="mb-2.5">Activity</Lab>
            <ActivityFeed programId={program.id} />
          </section>

          <section className="tile p-[14px_15px]">
            <Lab className="mb-2.5">Decisions</Lab>
            <ul className="flex flex-col">
              {decisions.map((d, i) => (
                <li key={d.id} className={i < decisions.length - 1 ? "border-b border-line2 py-2.5" : "pt-2.5"}>
                  <div className="text-[12px] font-medium text-tx">{d.title}</div>
                  <p className="mt-1 text-[11px] leading-snug text-tx3">{d.rationale}</p>
                  <div className="mt-1.5 text-[10px] text-tx4">
                    {d.decidedBy} · <DateOffset days={d.decidedAgoDays} dir="ago" />
                  </div>
                </li>
              ))}
              {decisions.length === 0 ? (
                <li className="py-3 text-center text-[11.5px] text-tx4">None recorded.</li>
              ) : null}
            </ul>
          </section>

          <section className="tile p-[14px_15px]">
            <Lab className="mb-2.5">Recent achievements</Lab>
            <ul className="flex flex-col">
              {achievements.map((a, i) => (
                <li
                  key={a.id}
                  className={`flex items-start gap-2 py-2 text-[11.5px] ${
                    i < achievements.length - 1 ? "border-b border-line2" : ""
                  }`}
                >
                  <span className="mt-[3px] text-grn">✓</span>
                  <span className="flex-1 text-tx2">{a.title}</span>
                  <span className="shrink-0 text-[10px] text-tx4">
                    <DateOffset days={a.agoDays} dir="ago" />
                  </span>
                </li>
              ))}
              {achievements.length === 0 ? (
                <li className="py-3 text-center text-[11.5px] text-tx4">None recorded.</li>
              ) : null}
            </ul>
          </section>

          <section className="tile p-[14px_15px]">
            <Lab className="mb-2.5">Stakeholders</Lab>
            <ul className="flex flex-col gap-2">
              {people.map((s) => (
                <li key={s.id} className="flex items-center gap-2.5">
                  <span
                    className="flex size-[24px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#4C6EF5,#22B8CF)" }}
                  >
                    {s.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] text-tx">{s.name}</span>
                    <span className="block truncate text-[10px] text-tx4">
                      {s.role} · {s.org}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
