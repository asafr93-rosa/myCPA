import type { CategoryType } from '../../store/useFinanceStore'
import { CATEGORY_CONFIG } from './CategoryBadge'

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as CategoryType[]

interface Props {
  value: CategoryType
  onChange: (cat: CategoryType) => void
  disabled?: boolean
}

export function CategorySelect({ value, onChange, disabled }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CategoryType)}
      disabled={disabled}
      className="text-xs rounded-lg border border-[#E5E7EB] bg-white text-[#374151] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 disabled:opacity-50"
    >
      {CATEGORIES.map((cat) => (
        <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
      ))}
    </select>
  )
}
