import Link from "next/link";
import { getProgramById, getStakeholders } from "@/lib/data";
import { ragColor } from "@/lib/utils";
import { DateOffset, Lab, RagDot } from "@/components/ui/primitives";

export default function StakeholdersPage() {
  const people = getStakeholders();

  return (
    <div className="mx-auto max-w-[1100px] p-3.5">
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <h1 className="text-[15px] font-semibold tracking-[-0.3px]">Stakeholders</h1>
        <span className="text-[11px] text-tx4">
          Communication preferences shape how generated updates are written for each person.
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((s) => {
          const programs = s.programIds
            .map((id) => getProgramById(id))
            .filter((p): p is NonNullable<typeof p> => Boolean(p));

          return (
            <section key={s.id} className="tile tile-hover flex flex-col p-[14px_15px]">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex size-[32px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#4C6EF5,#22B8CF)" }}
                >
                  {s.initials}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium">{s.name}</div>
                  <div className="truncate text-[10.5px] text-tx4">
                    {s.role} · {s.org}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <Lab className="mb-1.5">Prefers</Lab>
                <p className="text-[11.5px] leading-snug text-tx3">{s.commsPrefs}</p>
              </div>

              <div className="mt-3">
                <Lab className="mb-1.5">Programs</Lab>
                <ul className="flex flex-wrap gap-1.5">
                  {programs.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/programs/${p.key.toLowerCase()}`}
                        className="flex items-center gap-1.5 rounded-md border border-line px-2 py-[3px] text-[10px] text-tx3 transition-colors hover:text-tx"
                        style={{ borderColor: `color-mix(in srgb, ${ragColor[p.status]} 30%, var(--line))` }}
                      >
                        <RagDot status={p.status} size={5} />
                        {p.key}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-3 text-[10px] text-tx4">
                Last interaction · <DateOffset days={s.lastInteractionAgoDays} dir="ago" />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
