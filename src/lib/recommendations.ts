import type { BankAccount, Investment, PriorityItem } from '../store/useFinanceStore'
import { computeTotalBalance } from '../store/useFinanceStore'
import { formatCurrency, convertAmount } from './formatters'

export interface Suggestion {
  id: string
  type: 'transfer' | 'savings_withdrawal' | 'deposit_withdrawal' | 'liquidation'
  fromId: string
  fromType: 'bank_balance' | 'bank_deposits' | 'investment'
  fromLabel: string
  toAccountId: string
  toLabel: string
  amountILS: number   // always in ILS for display
  message: string     // plain-language sentence
  deficitAccountId: string
}

export function computeRecommendations(
  accounts: BankAccount[],
  investments: Investment[],
  priority: PriorityItem[],
  rates: { USD_ILS: number; EUR_ILS: number }
): Suggestion[] {
  const suggestions: Suggestion[] = []

  // Mutable available amounts in ILS (for simulation)
  const liquidILS = new Map<string, number>(
    accounts.map((a) => [a.id, convertAmount(a.balance, a.balanceCurrency, 'ILS', rates)])
  )
  const depositsILS = new Map<string, number>(
    accounts.map((a) => [a.id, convertAmount(a.deposits, a.depositsCurrency, 'ILS', rates)])
  )
  const investmentILS = new Map<string, number>(
    investments.map((i) => [i.id, convertAmount(i.balance, i.currency, 'ILS', rates)])
  )

  for (const account of accounts) {
    const totalILS = computeTotalBalance(account, rates)
    if (totalILS >= 0) continue

    let deficitILS = Math.abs(totalILS)

    for (const item of priority) {
      if (deficitILS <= 0) break

      if (item.type === 'bank_balance' && item.id && item.id !== account.id) {
        const avail = liquidILS.get(item.id) ?? 0
        if (avail <= 0) continue
        const amount = Math.min(avail, deficitILS)
        const sourceAcc = accounts.find((a) => a.id === item.id)
        if (!sourceAcc) continue

        suggestions.push({
          id: `sug-${Date.now()}-${Math.random()}`,
          type: 'transfer',
          fromId: item.id,
          fromType: 'bank_balance',
          fromLabel: sourceAcc.name,
          toAccountId: account.id,
          toLabel: account.name,
          amountILS: amount,
          message: `Transfer **${sourceAcc.name}** → **${account.name}**: ${formatCurrency(amount, 'ILS')}`,
          deficitAccountId: account.id,
        })
        liquidILS.set(item.id, avail - amount)
        deficitILS -= amount

      } else if (item.type === 'bank_deposits' && item.id) {
        const avail = depositsILS.get(item.id) ?? 0
        if (avail <= 0) continue
        const amount = Math.min(avail, deficitILS)
        const sourceAcc = accounts.find((a) => a.id === item.id)
        if (!sourceAcc) continue

        suggestions.push({
          id: `sug-${Date.now()}-${Math.random()}`,
          type: 'deposit_withdrawal',
          fromId: item.id,
          fromType: 'bank_deposits',
          fromLabel: sourceAcc.name,
          toAccountId: account.id,
          toLabel: account.name,
          amountILS: amount,
          message: `Withdraw from deposits in **${sourceAcc.name}** to cover **${account.name}**: ${formatCurrency(amount, 'ILS')}`,
          deficitAccountId: account.id,
        })
        depositsILS.set(item.id, avail - amount)
        deficitILS -= amount

      } else if (item.type === 'investment' && item.id) {
        const avail = investmentILS.get(item.id) ?? 0
        if (avail <= 0) continue
        const amount = Math.min(avail, deficitILS)
        const inv = investments.find((i) => i.id === item.id)
        if (!inv) continue

        suggestions.push({
          id: `sug-${Date.now()}-${Math.random()}`,
          type: 'liquidation',
          fromId: item.id,
          fromType: 'investment',
          fromLabel: inv.name,
          toAccountId: account.id,
          toLabel: account.name,
          amountILS: amount,
          message: `Liquidate **${inv.name}** to cover **${account.name}**: ${formatCurrency(amount, 'ILS')}`,
          deficitAccountId: account.id,
        })
        investmentILS.set(item.id, avail - amount)
        deficitILS -= amount
      }
    }
  }

  return suggestions
}
