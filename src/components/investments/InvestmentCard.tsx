import { useState } from 'react'
import type { Investment } from '../../store/useFinanceStore'
import { useFinanceStore } from '../../store/useFinanceStore'
import { formatCurrency, convertAmount } from '../../lib/formatters'

interface InvestmentCardProps {
  investment: Investment
  onEdit: () => void
  onDelete: () => void
}

export function InvestmentCard({ investment, onEdit, onDelete }: InvestmentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const rates = useFinanceStore((s) => s.settings.exchangeRates)
  const balanceILS = convertAmount(investment.balance, investment.currency, 'ILS', rates)
  const CHAR_LIMIT = 80

  return (
    <div className="glass-card p-5 flex flex-col gap-4">
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

        <div className="flex items-center gap-1 shrink-0">
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
    </div>
  )
}
