import { useState } from 'react'
import type { Investment } from '../../store/useFinanceStore'
import { useFinanceStore } from '../../store/useFinanceStore'
import { formatCurrency, formatCompact, convertAmount } from '../../lib/formatters'
import {
  totalReturnPct,
  totalReturnAbs,
  periodReturnPct,
  sparklineData,
  isDue,
} from '../../lib/investmentMetrics'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface InvestmentCardProps {
  investment: Investment
  onEdit: () => void
  onDelete: () => void
  onLogValue: () => void
  onHistory: () => void
}

export function InvestmentCard({ investment, onEdit, onDelete, onLogValue, onHistory }: InvestmentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const rates = useFinanceStore((s) => s.settings.exchangeRates)
  const snapshots = useFinanceStore((s) => s.snapshots)
  const trackingSettings = useFinanceStore((s) => s.trackingSettings)

  const balanceILS = convertAmount(investment.balance, investment.currency, 'ILS', rates)
  const CHAR_LIMIT = 90

  const retPct = totalReturnPct(snapshots, investment.id)
  const retAbs = totalReturnAbs(snapshots, investment.id)
  const perPct = periodReturnPct(snapshots, investment.id)
  const chartData = sparklineData(snapshots, investment.id)
  const tracking = trackingSettings.find((t) => t.investmentId === investment.id)
  const overdue = isDue(tracking)

  const hasReturn = retPct !== null
  const hasChart = chartData.length >= 2

  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C084FC]/10 border border-[#C084FC]/20 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12l3-3 2 2 3.5-4.5 3 2.5" stroke="#C084FC" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 5v3h-3" stroke="#C084FC" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="font-medium text-[#E6EDF3]">{investment.name}</p>
            <p className="text-xs text-[#7D8590]">{investment.currency}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Log Value button */}
          <button
            onClick={onLogValue}
            className="relative text-[#7D8590] hover:text-[#00D4AA] p-1.5 rounded-lg hover:bg-[#00D4AA]/8 transition-colors"
            title="Log new value"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 10l3-3 2 2 3-4 2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="11" cy="3.5" r="2" fill="currentColor" stroke="#0D1117" strokeWidth="0.5"/>
              <path d="M11 2.5v2M10 3.5h2" stroke="#0D1117" strokeWidth="0.9" strokeLinecap="round"/>
            </svg>
            {overdue && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            )}
          </button>
          <button onClick={onEdit} className="text-[#7D8590] hover:text-[#E6EDF3] p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={onDelete} className="text-[#F87171]/50 hover:text-[#F87171] p-1.5 rounded-lg hover:bg-[#F87171]/10 transition-colors">
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path d="M2 3h8M5 3V2h2v1M10 3l-.8 7.5a.5.5 0 01-.5.5H3.3a.5.5 0 01-.5-.5L2 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Balance */}
      <div>
        <p className="font-mono text-2xl font-semibold text-[#E6EDF3]">
          {formatCurrency(balanceILS, 'ILS')}
        </p>
        {investment.currency !== 'ILS' && (
          <p className="text-xs text-[#484F58] font-mono mt-0.5">
            ≈ {formatCurrency(investment.balance, investment.currency)}
          </p>
        )}
      </div>

      {/* Description */}
      {investment.description && (
        <div className="text-sm text-[#7D8590] leading-relaxed">
          {expanded || investment.description.length <= CHAR_LIMIT
            ? investment.description
            : `${investment.description.slice(0, CHAR_LIMIT)}...`}
          {investment.description.length > CHAR_LIMIT && (
            <button onClick={() => setExpanded((e) => !e)} className="ml-1 text-[#58A6FF] hover:underline text-xs">
              {expanded ? 'Less' : 'More'}
            </button>
          )}
        </div>
      )}

      {/* Return box */}
      {hasReturn ? (
        <div className="rounded-xl bg-[#161B22] border border-white/8 px-4 py-3 flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-mono font-semibold ${(retPct ?? 0) >= 0 ? 'text-[#00D4AA]' : 'text-[#F87171]'}`}>
                {(retPct ?? 0) >= 0 ? '+' : ''}{retPct!.toFixed(2)}%
              </span>
              <span className="text-[10px] text-[#484F58] uppercase tracking-wider">all time</span>
            </div>
            {perPct !== null && (
              <>
                <span className="text-[#484F58]">·</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-mono font-semibold ${perPct >= 0 ? 'text-[#00D4AA]' : 'text-[#F87171]'}`}>
                    {perPct >= 0 ? '+' : ''}{perPct.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-[#484F58] uppercase tracking-wider">vs last</span>
                </div>
              </>
            )}
          </div>
          {retAbs !== null && (
            <p className={`text-xs font-mono ${retAbs >= 0 ? 'text-[#00D4AA]/60' : 'text-[#F87171]/60'}`}>
              {retAbs >= 0 ? '+' : ''}{formatCompact(retAbs, 'ILS')} total gain
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-[#161B22] border border-white/8 px-4 py-3">
          <p className="text-xs text-[#484F58]">No comparison yet — log again next month to track returns.</p>
        </div>
      )}

      {/* Bar chart */}
      {hasChart ? (
        <div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#484F58' }} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(v) => formatCompact(v, 'ILS')}
                  tick={{ fontSize: 8, fill: '#484F58' }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                />
                <Tooltip
                  contentStyle={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#7D8590' }}
                  formatter={(v) => [formatCurrency(Number(v), 'ILS'), 'Value']}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="valueILS" fill="#00D4AA" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button onClick={onHistory} className="mt-1 text-[10px] text-[#484F58] hover:text-[#58A6FF] transition-colors">
            View all history →
          </button>
        </div>
      ) : (
        <p className="text-[10px] text-[#484F58]">Log values each month to see your chart.</p>
      )}
    </div>
  )
}
