import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { CreditCardTransaction, CategoryType } from '../../store/useFinanceStore'
import { formatCurrency, formatCompact } from '../../lib/formatters'
import { CATEGORY_COLORS, CATEGORY_CONFIG } from './CategoryBadge'

interface Props {
  transactions: CreditCardTransaction[]
  displayCurrency: string
  rates: { USD_ILS: number; EUR_ILS: number; GBP_ILS: number }
}

export function CategoryBreakdownChart({ transactions, displayCurrency, rates }: Props) {
  const data = useMemo(() => {
    const byCat: Partial<Record<CategoryType, number>> = {}
    for (const t of transactions) {
      const inILS = t.currency === 'ILS' ? t.amount
        : t.currency === 'USD' ? t.amount * rates.USD_ILS
        : t.currency === 'EUR' ? t.amount * rates.EUR_ILS
        : t.amount * rates.GBP_ILS
      byCat[t.category] = (byCat[t.category] ?? 0) + inILS
    }
    return (Object.entries(byCat) as [CategoryType, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([cat, value]) => ({ cat, label: CATEGORY_CONFIG[cat].label, value }))
  }, [transactions, rates])

  if (!data.length) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-[200px]">
        <p className="text-sm text-[#9CA3AF]">No expense data to display</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-4">
      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">By Category</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v) => formatCompact(Number(v), 'ILS')}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
            formatter={(v) => [formatCurrency(Number(v), displayCurrency as 'ILS'), 'Amount']}
            labelStyle={{ color: '#111827', fontWeight: 600 }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.cat} fill={CATEGORY_COLORS[entry.cat]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
