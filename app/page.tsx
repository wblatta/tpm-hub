import {
  getBrief,
  getOpenRisks,
  getPortfolioStats,
  getPrograms,
  getSpendCap,
  riskCountsByProgram,
} from "@/lib/data";
import { BriefTile } from "@/components/dashboard/brief-tile";
import { InboxStrip } from "@/components/dashboard/inbox-strip";
import { HealthTile, ProgramsTile, RiskTile, SpendTile } from "@/components/dashboard/tiles";

/**
 * Bento dashboard — asymmetric 6-column grid.
 * Spans: brief 4×2 · spend 2 · risks 2 · programs 4 · health 2 · inbox 6.
 */
export default function DashboardPage() {
  const brief = getBrief();
  const programs = getPrograms();
  const openRisks = getOpenRisks();
  const stats = getPortfolioStats();

  // Risks opened per day over the last week, oldest first.
  const trend = Array.from({ length: 7 }, (_, i) => {
    const dayFromEnd = 6 - i;
    return openRisks.filter(
      (r) => r.openedAgoDays >= dayFromEnd && r.openedAgoDays < dayFromEnd + 4,
    ).length;
  });

  return (
    <div className="grid grid-cols-1 gap-3 p-3.5 sm:grid-cols-6">
      <BriefTile brief={brief} />
      <SpendTile cap={getSpendCap()} />
      <RiskTile
        openCount={stats.openRiskCount}
        openedThisWeek={stats.risksOpenedThisWeek}
        trend={trend}
      />
      <ProgramsTile programs={programs} riskCounts={riskCountsByProgram(openRisks)} />
      <HealthTile programs={programs} />
      <InboxStrip />
    </div>
  );
}
