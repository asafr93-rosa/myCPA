import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import type { CreditCardTransaction, CreditCard } from '../../store/useFinanceStore'
import { formatCurrency, formatCompact } from '../../lib/formatters'

interface Props {
  transactions: CreditCardTransaction[]
  creditCards: CreditCard[]
  displayCurrency: string
  rates: { USD_ILS: number; EUR_ILS: number; GBP_ILS: number }
}

function toILS(amount: number, currency: string, rates: Props['rates']): number {
  if (currency === 'ILS') return amount
  if (currency === 'USD') return amount * rates.USD_ILS
  if (currency === 'EUR') return amount * rates.EUR_ILS
  return amount * rates.GBP_ILS
}

export function TrendChart({ transactions, creditCards, displayCurrency, rates }: Props) {
  const { data, cardNames } = useMemo(() => {
    if (!transactions.length) return { data: [], cardNames: [] }

    // Build month buckets for last 12 months
    const now = new Date()
    const months: string[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }

    const cardNames = creditCards.map((c) => c.name)

    const data = months.map((month) => {
      const row: Record<string, string | number> = { month: month.slice(5) } // "MM" for label
      for (const card of creditCards) {
        const total = transactions
          .filter((t) => t.creditCardId === card.id && t.date.startsWith(month))
          .reduce((s, t) => s + toILS(t.amount, t.currency, rates), 0)
        row[card.name] = total
      }
      return row
    })

    return { data, cardNames }
  }, [transactions, creditCards, rates])

  const LINE_COLORS = ['#00C896', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444']

  if (!data.length) return null

  return (
    <div className="glass-card p-4">
      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Monthly Trend</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v) => formatCompact(Number(v), 'ILS')}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
            formatter={(v) => [formatCurrency(Number(v), displayCurrency as 'ILS'), '']}
            labelStyle={{ color: '#111827', fontWeight: 600 }}
          />
          {cardNames.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />}
          {cardNames.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
