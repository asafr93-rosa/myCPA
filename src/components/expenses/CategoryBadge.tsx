import type { CategoryType } from '../../store/useFinanceStore'

const CATEGORY_CONFIG: Record<CategoryType, { label: string; bg: string; text: string }> = {
  food:      { label: 'Food',          bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]' },
  bills:     { label: 'Bills',         bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]' },
  insurance: { label: 'Insurance',     bg: 'bg-[#EDE9FE]', text: 'text-[#5B21B6]' },
  transport: { label: 'Transport',     bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
  fuel:      { label: 'Fuel',          bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]' },
  haircut:   { label: 'Haircut',       bg: 'bg-[#FCE7F3]', text: 'text-[#9D174D]' },
  household: { label: 'Household',     bg: 'bg-[#F3F4F6]', text: 'text-[#374151]' },
}

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  food:      '#10B981',
  bills:     '#3B82F6',
  insurance: '#8B5CF6',
  transport: '#F59E0B',
  fuel:      '#EF4444',
  haircut:   '#EC4899',
  household: '#6B7280',
}

export { CATEGORY_CONFIG }

interface Props {
  category: CategoryType
  size?: 'sm' | 'xs'
}

export function CategoryBadge({ category, size = 'sm' }: Props) {
  const cfg  = CATEGORY_CONFIG[category]
  const text = size === 'xs' ? 'text-[9px]' : 'text-[10px]'
  const pad  = size === 'xs' ? 'px-1.5 py-0.5' : 'px-2 py-0.5'
  return (
    <span className={`inline-flex items-center rounded-full font-semibold tracking-wide ${cfg.bg} ${cfg.text} ${text} ${pad}`}>
      {cfg.label}
    </span>
  )
}
