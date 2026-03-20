import type { Suggestion } from '../../lib/recommendations'
import { formatCurrency } from '../../lib/formatters'

interface RecommendationCardProps {
  suggestion: Suggestion
}

const TYPE_CONFIG: Record<Suggestion['type'], { label: string; color: string; icon: React.ReactNode }> = {
  transfer: {
    label: 'TRANSFER',
    color: '#00D4AA',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7h10M8 3l4 4-4 4" stroke="#00D4AA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  savings_withdrawal: {
    label: 'SAVINGS',
    color: '#58A6FF',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 2v10M3 8l4 4 4-4" stroke="#58A6FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  deposit_withdrawal: {
    label: 'DEPOSITS',
    color: '#C084FC',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 2v10M3 8l4 4 4-4" stroke="#C084FC" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  liquidation: {
    label: 'LIQUIDATION',
    color: '#F59E0B',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 10l3-3 2 2 3-4 2 2" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
}

export function RecommendationCard({ suggestion }: RecommendationCardProps) {
  const config = TYPE_CONFIG[suggestion.type]

  return (
    <div
      className="glass-card p-4 space-y-3 animate-fade-in border-l-2"
      style={{ borderLeftColor: `${config.color}60` }}
    >
      {/* Header row: icon + type label + amount */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${config.color}12`, border: `1px solid ${config.color}25` }}
        >
          {config.icon}
        </div>
        <span
          className="text-[10px] font-semibold tracking-widest"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
        <span className="ml-auto font-mono text-sm font-semibold text-[#E6EDF3]">
          {formatCurrency(suggestion.amountILS, 'ILS')}
        </span>
      </div>

      {/* Source → Destination */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-[#7D8590] truncate max-w-[90px]">{suggestion.fromLabel}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-[#484F58]">
          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[#E6EDF3] font-medium truncate max-w-[90px]">{suggestion.toLabel}</span>
      </div>
    </div>
  )
}
