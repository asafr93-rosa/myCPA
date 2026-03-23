import type { BankAccount } from '../../store/useFinanceStore'
import { computeTotalBalance } from '../../store/useFinanceStore'
import { formatCurrency, convertAmount } from '../../lib/formatters'
import { useFinanceStore } from '../../store/useFinanceStore'

interface AccountCardProps {
  account: BankAccount
  onEdit: () => void
  onDelete: () => void
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const rates = useFinanceStore((s) => s.settings.exchangeRates)
  const totalILS = computeTotalBalance(account, rates)
  const isNegative = totalILS < 0

  const depositsILS = convertAmount(account.deposits, account.depositsCurrency, 'ILS', rates)

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-[#0D1117] font-bold text-sm"
            style={{ background: account.color }}
          >
            {account.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[#E6EDF3]">{account.name}</p>
              {isNegative && (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="shrink-0">
                  <path d="M7 1.5L13 12H1L7 1.5z" stroke="#F87171" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M7 5.5v3" stroke="#F87171" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="7" cy="10" r="0.6" fill="#F87171"/>
                </svg>
              )}
            </div>
            <p className="text-xs text-[#484F58]">{account.balanceCurrency}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="text-[#7D8590] hover:text-[#E6EDF3] p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            title="Edit"
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="text-[#F87171]/50 hover:text-[#F87171] p-1.5 rounded-lg hover:bg-[#F87171]/10 transition-colors"
            title="Delete"
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path d="M2 3h8M5 3V2h2v1M10 3l-.8 7.5a.5.5 0 01-.5.5H3.3a.5.5 0 01-.5-.5L2 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Summary rows */}
      <div className="space-y-2.5 pt-1 border-t border-white/8">
        {/* Total Balance */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#7D8590]">Total Balance</span>
          <div className="text-right">
            <span className={`font-mono text-base font-semibold ${isNegative ? 'text-[#F87171]' : 'text-[#00D4AA]'}`}>
              {formatCurrency(totalILS, 'ILS')}
            </span>
            {account.balanceCurrency !== 'ILS' && (
              <p className="text-[10px] text-[#484F58] font-mono">
                {formatCurrency(account.balance, account.balanceCurrency)} native
              </p>
            )}
          </div>
        </div>

        {/* Deposits */}
        {account.deposits > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#6B7280]">Deposits</span>
              <div className="text-right">
                <span className="font-mono text-sm font-semibold text-[#3B82F6]">
                  {formatCurrency(depositsILS, 'ILS')}
                </span>
                {account.depositsCurrency !== 'ILS' && (
                  <p className="text-[10px] text-[#9CA3AF] font-mono">
                    {formatCurrency(account.deposits, account.depositsCurrency)} native
                  </p>
                )}
              </div>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${totalILS > 0 && depositsILS > 0 ? Math.min(100, Math.round((depositsILS / (Math.abs(totalILS) + depositsILS)) * 100)) : 100}%`,
                  background: '#3B82F6',
                }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
