import type { ParsedTransaction } from '../../lib/csvParser'
import type { CategorizeResult } from '../../lib/categorizer'
import type { CategoryType } from '../../store/useFinanceStore'
import { formatCurrency } from '../../lib/formatters'
import { CategorySelect } from '../expenses/CategorySelect'

interface Props {
  transactions: ParsedTransaction[]
  categorized: CategorizeResult[]
  overrides: Record<number, CategoryType>
  onOverride: (index: number, cat: CategoryType) => void
}

export function ImportPreviewTable({ transactions, categorized, overrides, onOverride }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <th className="px-3 py-2.5 text-left font-semibold text-[#6B7280]">Date</th>
            <th className="px-3 py-2.5 text-left font-semibold text-[#6B7280]">Business</th>
            <th className="px-3 py-2.5 text-left font-semibold text-[#6B7280]">Category</th>
            <th className="px-3 py-2.5 text-right font-semibold text-[#6B7280]">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, i) => {
            const cat    = overrides[i] ?? categorized[i]?.category ?? 'household'
            const source = overrides[i] ? 'user' : (categorized[i]?.source ?? 'keyword')
            return (
              <tr key={i} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                <td className="px-3 py-2 text-[#6B7280] font-mono whitespace-nowrap">{t.date}</td>
                <td className="px-3 py-2 text-[#111827] max-w-[180px] truncate font-medium">{t.businessName}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <CategorySelect
                      value={cat}
                      onChange={(newCat) => onOverride(i, newCat)}
                    />
                    {source !== 'user' && (
                      <span className={`text-[9px] font-semibold ${source === 'ai' ? 'text-[#8B5CF6]' : 'text-[#00C896]'}`}>
                        {source === 'ai' ? 'AI' : 'auto'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-mono font-semibold text-[#111827] whitespace-nowrap">
                  {formatCurrency(t.amount, t.currency as 'ILS')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
