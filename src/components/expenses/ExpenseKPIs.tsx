import { useMemo } from 'react'
import type { CreditCardTransaction, CategoryType } from '../../store/useFinanceStore'
import { formatCurrency } from '../../lib/formatters'
import { CATEGORY_CONFIG } from './CategoryBadge'

interface Props {
  transactions: CreditCardTransaction[]
  displayCurrency: string
  rates: { USD_ILS: number; EUR_ILS: number; GBP_ILS: number }
}

export function ExpenseKPIs({ transactions, displayCurrency, rates }: Props) {
  const stats = useMemo(() => {
    if (!transactions.length) return null

    const total = transactions.reduce((s, t) => {
      const inILS = t.currency === 'ILS' ? t.amount : t.currency === 'USD' ? t.amount * rates.USD_ILS : t.currency === 'EUR' ? t.amount * rates.EUR_ILS : t.amount * rates.GBP_ILS
      return s + inILS
    }, 0)

    const dates = transactions.map((t) => t.date).sort()
    const firstDate = new Date(dates[0])
    const lastDate  = new Date(dates[dates.length - 1])
    const days = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / 86400000) + 1)
    const daily = total / days

    const byCat: Partial<Record<CategoryType, number>> = {}
    for (const t of transactions) {
      const inILS = t.currency === 'ILS' ? t.amount : t.currency === 'USD' ? t.amount * rates.USD_ILS : t.currency === 'EUR' ? t.amount * rates.EUR_ILS : t.amount * rates.GBP_ILS
      byCat[t.category] = (byCat[t.category] ?? 0) + inILS
    }
    const topCat = (Object.entries(byCat) as [CategoryType, number][]).sort((a, b) => b[1] - a[1])[0]

    return { total, daily, topCat }
  }, [transactions, rates])

  const kpis = [
    {
      label: 'Total This Period',
      value: stats ? formatCurrency(stats.total, displayCurrency as 'ILS') : '—',
      sub: `${transactions.length} transactions`,
    },
    {
      label: 'Daily Average',
      value: stats ? formatCurrency(stats.daily, displayCurrency as 'ILS') : '—',
      sub: 'per day',
    },
    {
      label: 'Top Category',
      value: stats?.topCat ? CATEGORY_CONFIG[stats.topCat[0]].label : '—',
      sub: stats?.topCat ? formatCurrency(stats.topCat[1], displayCurrency as 'ILS') : '',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {kpis.map((k) => (
        <div key={k.label} className="glass-card px-4 py-3">
          <p className="text-[10px] text-[#6B7280] mb-1 uppercase tracking-wider">{k.label}</p>
          <p className="text-base font-bold text-[#111827] font-mono leading-tight">{k.value}</p>
          {k.sub && <p className="text-[10px] text-[#9CA3AF] mt-0.5">{k.sub}</p>}
        </div>
      ))}
    </div>
  )
}
