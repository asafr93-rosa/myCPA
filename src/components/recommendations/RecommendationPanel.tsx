import { useMemo } from 'react'
import { useFinanceStore } from '../../store/useFinanceStore'
import { computeRecommendations } from '../../lib/recommendations'
import { RecommendationCard } from './RecommendationCard'

export function RecommendationPanel() {
  const accounts = useFinanceStore((s) => s.accounts)
  const investments = useFinanceStore((s) => s.investments)
  const priorityConfig = useFinanceStore((s) => s.priorityConfig)
  const rates = useFinanceStore((s) => s.settings.exchangeRates)

  const suggestions = useMemo(
    () => computeRecommendations(accounts, investments, priorityConfig, rates),
    [accounts, investments, priorityConfig, rates]
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="shrink-0 px-4 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
          <span className="text-[10px] font-semibold text-[#484F58] uppercase tracking-widest">
            Suggestions
          </span>
        </div>
        <p className="text-[10px] text-[#30363D] pl-3.5">
          {suggestions.length === 0 ? 'All accounts healthy' : `${suggestions.length} recommendation${suggestions.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
        {suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-9 h-9 rounded-full bg-[#00D4AA]/8 flex items-center justify-center mb-2.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5 6.5-7" stroke="#00D4AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-xs font-medium text-[#7D8590]">All clear</p>
            <p className="text-[10px] text-[#30363D] mt-0.5">No deficits to cover</p>
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s) => (
              <RecommendationCard key={s.id} suggestion={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
