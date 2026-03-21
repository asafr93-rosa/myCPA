import { useState } from 'react'
import type { Asset } from '../../store/useFinanceStore'
import { useFinanceStore } from '../../store/useFinanceStore'
import { formatCurrency, convertAmount } from '../../lib/formatters'

const CATEGORY_LABELS: Record<Asset['category'], string> = {
  real_estate: 'Real Estate',
  vehicle: 'Vehicle',
  other: 'Other',
}

function CategoryIcon({ category }: { category: Asset['category'] }) {
  if (category === 'real_estate') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 14V7l7-5 7 5v7H1z" stroke="#F59E0B" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M6 14v-4h4v4" stroke="#F59E0B" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    )
  }
  if (category === 'vehicle') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 9l1.5-4h9L14 9v3H2V9z" stroke="#F59E0B" strokeWidth="1.4" strokeLinejoin="round"/>
        <circle cx="4.5" cy="12.5" r="1.5" stroke="#F59E0B" strokeWidth="1.2"/>
        <circle cx="11.5" cy="12.5" r="1.5" stroke="#F59E0B" strokeWidth="1.2"/>
        <path d="M2 9h12" stroke="#F59E0B" strokeWidth="1.2"/>
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="#F59E0B" strokeWidth="1.4"/>
      <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="#F59E0B" strokeWidth="1.4"/>
    </svg>
  )
}

interface AssetCardProps {
  asset: Asset
  onEdit: () => void
  onDelete: () => void
}

export function AssetCard({ asset, onEdit, onDelete }: AssetCardProps) {
  const [expanded, setExpanded] = useState(false)
  const rates = useFinanceStore((s) => s.settings.exchangeRates)
  const valueILS = convertAmount(asset.value, asset.currency, 'ILS', rates)
  const CHAR_LIMIT = 90

  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center shrink-0">
            <CategoryIcon category={asset.category} />
          </div>
          <div>
            <p className="font-medium text-[#E6EDF3]">{asset.name}</p>
            <p className="text-xs text-[#7D8590]">{CATEGORY_LABELS[asset.category]} · {asset.currency}</p>
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

      {/* Value */}
      <div>
        <p className="font-mono text-2xl font-semibold text-[#E6EDF3]">
          {formatCurrency(valueILS, 'ILS')}
        </p>
        {asset.currency !== 'ILS' && (
          <p className="text-xs text-[#484F58] font-mono mt-0.5">
            ≈ {formatCurrency(asset.value, asset.currency)}
          </p>
        )}
      </div>

      {/* Description */}
      {asset.description && (
        <div className="text-sm text-[#7D8590] leading-relaxed">
          {expanded || asset.description.length <= CHAR_LIMIT
            ? asset.description
            : `${asset.description.slice(0, CHAR_LIMIT)}...`}
          {asset.description.length > CHAR_LIMIT && (
            <button onClick={() => setExpanded((e) => !e)} className="ml-1 text-[#58A6FF] hover:underline text-xs">
              {expanded ? 'Less' : 'More'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
