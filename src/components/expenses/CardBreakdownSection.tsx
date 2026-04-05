import { useMemo } from 'react'
import type { CreditCard, CreditCardTransaction, BankAccount } from '../../store/useFinanceStore'
import { formatCurrency } from '../../lib/formatters'
import { CategoryBadge } from './CategoryBadge'

interface Props {
  creditCards: CreditCard[]
  transactions: CreditCardTransaction[]
  accounts: BankAccount[]
  displayCurrency: string
  rates: { USD_ILS: number; EUR_ILS: number; GBP_ILS: number }
}

function toILS(amount: number, currency: string, rates: Props['rates']): number {
  if (currency === 'ILS') return amount
  if (currency === 'USD') return amount * rates.USD_ILS
  if (currency === 'EUR') return amount * rates.EUR_ILS
  return amount * rates.GBP_ILS
}

export function CardBreakdownSection({ creditCards, transactions, accounts, displayCurrency, rates }: Props) {
  const cardStats = useMemo(() =>
    creditCards.map((card) => {
      const cardTxns = transactions.filter((t) => t.creditCardId === card.id)
      const total    = cardTxns.reduce((s, t) => s + toILS(t.amount, t.currency, rates), 0)
      const top3     = [...cardTxns].sort((a, b) => toILS(b.amount, b.currency, rates) - toILS(a.amount, a.currency, rates)).slice(0, 3)
      const linked   = accounts.find((a) => a.id === card.linkedBankAccountId)
      return { card, total, top3, linkedName: linked?.name ?? '—' }
    }),
  [creditCards, transactions, accounts, rates])

  if (!cardStats.length) return null

  return (
    <div className="glass-card p-4">
      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Per Card</p>
      <div className="flex flex-col gap-3">
        {cardStats.map(({ card, total, top3, linkedName }) => (
          <div key={card.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: card.color }}
                />
                <span className="text-sm font-semibold text-[#111827]">{card.name}</span>
                <span className="text-xs text-[#9CA3AF]">→ {linkedName}</span>
              </div>
              <span className="text-sm font-bold font-mono text-[#111827]">
                {formatCurrency(total, displayCurrency as 'ILS')}
              </span>
            </div>
            {top3.length > 0 && (
              <div className="flex flex-col gap-1 pl-5">
                {top3.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <CategoryBadge category={t.category} size="xs" />
                      <span className="text-xs text-[#6B7280] truncate">{t.businessName}</span>
                    </div>
                    <span className="text-xs font-mono text-[#374151] shrink-0 ml-2">
                      {formatCurrency(t.amount, t.currency as 'ILS')}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-[#F3F4F6]" />
          </div>
        ))}
      </div>
    </div>
  )
}
