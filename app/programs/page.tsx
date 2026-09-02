import Link from "next/link";
import { getOpenRisks, getPrograms, riskCountsByProgram } from "@/lib/data";
import { ragColor, ragLabel } from "@/lib/utils";
import { DateOffset, ProgressBar, RagDot } from "@/components/ui/primitives";

export default function ProgramsPage() {
  const programs = getPrograms();
  const openRisks = getOpenRisks();
  const counts = riskCountsByProgram(openRisks);
  const highCounts = riskCountsByProgram(openRisks.filter((r) => r.severity === "high"));

  return (
    <div className="mx-auto max-w-[1100px] p-3.5">
      <h1 className="mb-3.5 text-[15px] font-semibold tracking-[-0.3px]">Programs</h1>

      <div className="tile overflow-hidden p-0">
        <div className="hidden grid-cols-[1.9fr_92px_120px_1fr_110px] items-center gap-3 border-b border-line px-4 py-2.5 text-[8.5px] tracking-[1.1px] uppercase text-tx4 md:grid">
          <span>Program</span>
          <span>Status</span>
          <span>Open risks</span>
          <span>Progress</span>
          <span>Target</span>
        </div>

        <ul>
          {programs.map((p, i) => (
            <li key={p.id} className={i < programs.length - 1 ? "border-b border-line2" : ""}>
              <Link
                href={`/programs/${p.key.toLowerCase()}`}
                className="grid grid-cols-1 gap-2 px-4 py-3 transition-colors hover:bg-hov md:grid-cols-[1.9fr_92px_120px_1fr_110px] md:items-center md:gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-tx4">{p.key}</span>
                    <span className="truncate text-[13px] font-medium">{p.name}</span>
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-[11px] text-tx4">{p.description}</div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: ragColor[p.status] }}>
                  <RagDot status={p.status} />
                  {ragLabel[p.status]}
                </div>

                <div className="text-[11px] text-tx3 tabular-nums">
                  {counts[p.id] ?? 0} open
                  {(highCounts[p.id] ?? 0) > 0 ? (
                    <span className="ml-1.5" style={{ color: "var(--red)" }}>
                      {highCounts[p.id]} high
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2.5">
                  <ProgressBar value={p.progress} color={ragColor[p.status]} width="100%" />
                  <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-tx3">
                    {p.progress}%
                  </span>
                </div>

                <div className="text-[11px] text-tx3">
                  <DateOffset days={p.targetInDays} dir="in" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
