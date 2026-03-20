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
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
        <span className="text-xs font-semibold text-[#7D8590] uppercase tracking-wider">
          Suggestions
        </span>
      </div>

      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-[#00D4AA]/10 flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4 4 8-8" stroke="#00D4AA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-[#E6EDF3]">All clear</p>
          <p className="text-xs text-[#484F58] mt-1">No deficits to cover</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {suggestions.map((s) => (
            <RecommendationCard key={s.id} suggestion={s} />
          ))}
        </div>
      )}
    </div>
  )
}
