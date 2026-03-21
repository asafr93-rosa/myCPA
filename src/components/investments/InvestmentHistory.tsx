import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { formatCurrency, formatCompact } from '../../lib/formatters'
import {
  getSnapshots,
  totalReturnPct,
  totalReturnAbs,
  periodReturnPct,
} from '../../lib/investmentMetrics'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import type { Investment, InvestmentSnapshot, TrackingFrequency } from '../../store/useFinanceStore'
import { useFinanceStore } from '../../store/useFinanceStore'

interface InvestmentHistoryProps {
  open: boolean
  onClose: () => void
  investment: Investment
  onLogValue: () => void
}

function ReturnBadge({ value }: { value: number | null }) {
  if (value === null) return null
  const pos = value >= 0
  return (
    <span className={`text-xs font-mono font-semibold ${pos ? 'text-[#00D4AA]' : 'text-[#F87171]'}`}>
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}

export function InvestmentHistory({ open, onClose, investment, onLogValue }: InvestmentHistoryProps) {
  const snapshots = useFinanceStore((s) => s.snapshots)
  const trackingSettings = useFinanceStore((s) => s.trackingSettings)
  const deleteSnapshot = useFinanceStore((s) => s.deleteSnapshot)
  const updateTrackingSettings = useFinanceStore((s) => s.updateTrackingSettings)

  const sorted = getSnapshots(snapshots, investment.id)
  const retPct = totalReturnPct(snapshots, investment.id)
  const retAbs = totalReturnAbs(snapshots, investment.id)
  const periodPct = periodReturnPct(snapshots, investment.id)
  const tracking = trackingSettings.find((t) => t.investmentId === investment.id)

  const chartData = sorted.map((s) => ({
    date: new Date(s.recordedAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    valueILS: s.valueILS,
  }))

  const frequencies: { value: TrackingFrequency; label: string }[] = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'custom', label: 'Manual' },
  ]

  return (
    <Modal open={open} onClose={onClose} title={`History — ${investment.name}`}>
      <div className="space-y-5">
        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#161B22] border border-white/8 rounded-xl p-3">
            <p className="text-[10px] text-[#484F58] uppercase tracking-wider mb-1">All-time return</p>
            <ReturnBadge value={retPct} />
            {retAbs !== null && (
              <p className={`text-[10px] font-mono mt-0.5 ${retAbs >= 0 ? 'text-[#00D4AA]/70' : 'text-[#F87171]/70'}`}>
                {retAbs >= 0 ? '+' : ''}{formatCompact(retAbs, 'ILS')}
              </p>
            )}
            {retPct === null && <p className="text-xs text-[#484F58]">—</p>}
          </div>
          <div className="bg-[#161B22] border border-white/8 rounded-xl p-3">
            <p className="text-[10px] text-[#484F58] uppercase tracking-wider mb-1">Last period</p>
            <ReturnBadge value={periodPct} />
            {periodPct === null && <p className="text-xs text-[#484F58]">—</p>}
          </div>
          <div className="bg-[#161B22] border border-white/8 rounded-xl p-3">
            <p className="text-[10px] text-[#484F58] uppercase tracking-wider mb-1">Data points</p>
            <p className="text-sm font-semibold text-[#E6EDF3]">{sorted.length}</p>
          </div>
        </div>

        {/* Line chart */}
        {sorted.length >= 2 ? (
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#484F58' }} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(v) => formatCompact(v, 'ILS')}
                  tick={{ fontSize: 9, fill: '#484F58' }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#7D8590' }}
                  formatter={(v) => [formatCurrency(Number(v), 'ILS'), 'Value (ILS)']}
                />
                <Line
                  type="monotone"
                  dataKey="valueILS"
                  stroke="#00D4AA"
                  strokeWidth={2}
                  dot={{ fill: '#00D4AA', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-[#484F58] text-center py-4">Log at least 2 values to see the chart.</p>
        )}

        {/* Tracking frequency */}
        <div>
          <p className="text-[10px] text-[#484F58] uppercase tracking-wider mb-2">Tracking Frequency</p>
          <div className="flex gap-2">
            {frequencies.map((f) => (
              <button
                key={f.value}
                onClick={() => updateTrackingSettings(investment.id, { frequency: f.value })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  (tracking?.frequency ?? 'monthly') === f.value
                    ? 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30'
                    : 'bg-[#161B22] text-[#7D8590] border border-white/8 hover:border-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Snapshot table */}
        {sorted.length > 0 && (
          <div>
            <p className="text-[10px] text-[#484F58] uppercase tracking-wider mb-2">All Snapshots</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto overscroll-contain pr-1">
              {[...sorted].reverse().map((s) => (
                <SnapshotRow key={s.id} snapshot={s} onDelete={() => deleteSnapshot(s.id)} />
              ))}
            </div>
          </div>
        )}

        <Button variant="primary" className="w-full" onClick={() => { onLogValue(); onClose() }}>
          Log New Value
        </Button>
      </div>
    </Modal>
  )
}

function SnapshotRow({ snapshot, onDelete }: { snapshot: InvestmentSnapshot; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161B22] border border-white/5 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#E6EDF3] font-mono">{formatCurrency(snapshot.value, snapshot.currency)}</span>
          {snapshot.currency !== 'ILS' && (
            <span className="text-[10px] text-[#484F58] font-mono">≈ {formatCompact(snapshot.valueILS, 'ILS')}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-[#484F58]">
            {new Date(snapshot.recordedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {snapshot.note && <span className="text-[10px] text-[#484F58] truncate">· {snapshot.note}</span>}
        </div>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-[#F87171]/50 hover:text-[#F87171] p-1 rounded transition-all"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M2 3h8M5 3V2h2v1M10 3l-.8 7.5a.5.5 0 01-.5.5H3.3a.5.5 0 01-.5-.5L2 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
