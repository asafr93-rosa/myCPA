import type { InvestmentSnapshot, InvestmentTracking } from '../store/useFinanceStore'

/** All snapshots for an investment, sorted oldest → newest */
export function getSnapshots(snapshots: InvestmentSnapshot[], investmentId: string): InvestmentSnapshot[] {
  return snapshots
    .filter((s) => s.investmentId === investmentId)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
}

/** Latest snapshot ILS value, or 0 */
export function latestValueILS(snapshots: InvestmentSnapshot[], investmentId: string): number {
  const sorted = getSnapshots(snapshots, investmentId)
  return sorted.length > 0 ? sorted[sorted.length - 1].valueILS : 0
}

/** Total return % from first to last snapshot. Returns null if < 2 snapshots. */
export function totalReturnPct(snapshots: InvestmentSnapshot[], investmentId: string): number | null {
  const sorted = getSnapshots(snapshots, investmentId)
  if (sorted.length < 2) return null
  const first = sorted[0].valueILS
  const last = sorted[sorted.length - 1].valueILS
  if (first === 0) return null
  return ((last - first) / first) * 100
}

/** Total return in ILS (latest − first). Returns null if < 2 snapshots. */
export function totalReturnAbs(snapshots: InvestmentSnapshot[], investmentId: string): number | null {
  const sorted = getSnapshots(snapshots, investmentId)
  if (sorted.length < 2) return null
  return sorted[sorted.length - 1].valueILS - sorted[0].valueILS
}

/** Period return % (latest vs previous snapshot). Returns null if < 2 snapshots. */
export function periodReturnPct(snapshots: InvestmentSnapshot[], investmentId: string): number | null {
  const sorted = getSnapshots(snapshots, investmentId)
  if (sorted.length < 2) return null
  const prev = sorted[sorted.length - 2].valueILS
  const last = sorted[sorted.length - 1].valueILS
  if (prev === 0) return null
  return ((last - prev) / prev) * 100
}

/** Data for Recharts BarChart — [{ date: 'Jan 25', valueILS }] */
export function sparklineData(
  snapshots: InvestmentSnapshot[],
  investmentId: string
): { date: string; valueILS: number }[] {
  return getSnapshots(snapshots, investmentId).map((s) => ({
    date: new Date(s.recordedAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    valueILS: s.valueILS,
  }))
}

/** True if the investment is overdue for a new log based on its tracking frequency */
export function isDue(tracking: InvestmentTracking | undefined): boolean {
  if (!tracking || !tracking.lastLoggedAt) return false
  const last = new Date(tracking.lastLoggedAt).getTime()
  const now = Date.now()
  const days = (now - last) / (1000 * 60 * 60 * 24)
  if (tracking.frequency === 'monthly') return days >= 28
  if (tracking.frequency === 'quarterly') return days >= 85
  return false
}

/** Weighted portfolio return % across all investments.
 *  Formula: (Σ latestValueILS − Σ firstValueILS) / Σ firstValueILS × 100
 *  Returns null if no investment has ≥ 2 snapshots.
 */
export function portfolioWeightedReturn(
  snapshots: InvestmentSnapshot[],
  investmentIds: string[]
): number | null {
  let sumFirst = 0
  let sumLatest = 0
  let hasData = false
  for (const id of investmentIds) {
    const sorted = getSnapshots(snapshots, id)
    if (sorted.length >= 2) {
      sumFirst += sorted[0].valueILS
      sumLatest += sorted[sorted.length - 1].valueILS
      hasData = true
    }
  }
  if (!hasData || sumFirst === 0) return null
  return ((sumLatest - sumFirst) / sumFirst) * 100
}
