import { useMemo } from 'react'
import { useFinanceStore, computeTotalBalance } from '../store/useFinanceStore'
import { AnimatedCounter } from '../components/ui/AnimatedCounter'
import { formatCurrency, convertAmount } from '../lib/formatters'
import { computeRecommendations } from '../lib/recommendations'
import { Link } from 'react-router-dom'

function KPICard({ label, value, isNegative = false }: {
  label: string; value: number; isNegative?: boolean
}) {
  return (
    <div className="glass-card px-4 py-3 flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-[#484F58] uppercase tracking-widest">{label}</span>
      <AnimatedCounter
        value={value}
        currency="ILS"
        className={`text-lg font-semibold font-mono ${isNegative ? 'text-[#F87171]' : 'text-[#E6EDF3]'}`}
      />
    </div>
  )
}

function SuggestionPill({ message, amount, color }: { message: string; amount: number; color: string }) {
  const parts = message.split(/\*\*(.+?)\*\*/g)
  return (
    <div
      className="glass-card px-4 py-3 flex items-start gap-3 animate-slide-up"
      style={{ borderLeft: `2px solid ${color}60` }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#7D8590] leading-relaxed">
          {parts.map((part, i) =>
            i % 2 === 1
              ? <strong key={i} className="text-[#E6EDF3] font-semibold">{part}</strong>
              : part
          )}
        </p>
      </div>
      <span className="font-mono text-xs font-semibold shrink-0" style={{ color }}>
        {formatCurrency(amount, 'ILS')}
      </span>
    </div>
  )
}

const SUGGESTION_COLORS = {
  transfer: '#00D4AA',
  savings_withdrawal: '#58A6FF',
  deposit_withdrawal: '#C084FC',
  liquidation: '#F59E0B',
}

export function Dashboard() {
  const accounts = useFinanceStore((s) => s.accounts)
  const investments = useFinanceStore((s) => s.investments)
  const priorityConfig = useFinanceStore((s) => s.priorityConfig)
  const rates = useFinanceStore((s) => s.settings.exchangeRates)

  const totals = useMemo(() => {
    const liquid = accounts.reduce((s, a) => s + computeTotalBalance(a, rates), 0)
    const deposits = accounts.reduce(
      (s, a) => s + convertAmount(a.deposits, a.depositsCurrency, 'ILS', rates),
      0
    )
    const stocks = accounts.reduce(
      (s, a) => s + convertAmount(a.stockBalance, a.stockCurrency, 'ILS', rates),
      0
    )
    const inv = investments.reduce(
      (s, i) => s + convertAmount(i.balance, i.currency, 'ILS', rates),
      0
    )
    const netWorth = liquid + deposits + stocks + inv
    return { netWorth, liquid, deposits, inv }
  }, [accounts, investments, rates])

  const suggestions = useMemo(
    () => computeRecommendations(accounts, investments, priorityConfig, rates),
    [accounts, investments, priorityConfig, rates]
  )

  if (accounts.length === 0 && investments.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 pb-20 md:pb-0">
        <div className="w-14 h-14 rounded-2xl bg-[#161B22] border border-white/8 flex items-center justify-center mb-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#7D8590" strokeWidth="1.5"/>
            <path d="M9 22V12h6v10" stroke="#7D8590" strokeWidth="1.5"/>
          </svg>
        </div>
        <h2 className="text-base font-semibold text-[#E6EDF3] mb-1.5">No data yet</h2>
        <p className="text-sm text-[#7D8590] mb-5">Add bank accounts or investments to get started</p>
        <Link to="/accounts" className="text-sm font-medium text-[#00D4AA] hover:underline">
          Add account →
        </Link>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-3">
        <h1 className="text-base font-semibold text-[#E6EDF3] leading-tight">Dashboard</h1>
        <p className="text-xs text-[#484F58]">All amounts in ILS ₪</p>
      </div>

      {/* KPI strip */}
      <div className="shrink-0 px-5 pb-3 grid grid-cols-2 gap-2">
        <KPICard label="Net Worth" value={totals.netWorth} isNegative={totals.netWorth < 0} />
        <KPICard label="Liquid" value={totals.liquid} isNegative={totals.liquid < 0} />
        <KPICard label="Deposits" value={totals.deposits} />
        <KPICard label="Investments" value={totals.inv} />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-24 md:pb-6 space-y-5">

        {/* Negative account warnings */}
        {accounts.filter((a) => computeTotalBalance(a, rates) < 0).map((acc) => (
          <div key={acc.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#F87171]/8 border border-[#F87171]/20">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <path d="M7 1L13 12H1L7 1z" stroke="#F87171" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M7 5.5v3" stroke="#F87171" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="7" cy="10" r="0.6" fill="#F87171"/>
            </svg>
            <span className="text-xs text-[#F87171]">
              <strong>{acc.name}</strong> — negative balance ({formatCurrency(computeTotalBalance(acc, rates), 'ILS')})
            </span>
          </div>
        ))}

        {/* Bank accounts */}
        {accounts.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#484F58] uppercase tracking-widest mb-2">Bank Accounts</p>
            <div className="space-y-2">
              {accounts.map((acc) => {
                const total = computeTotalBalance(acc, rates)
                const isNeg = total < 0
                return (
                  <div key={acc.id} className="glass-card px-4 py-3 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[#0D1117] font-bold text-xs"
                      style={{ background: acc.color }}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#E6EDF3] truncate">{acc.name}</p>
                      <p className="text-[10px] text-[#484F58]">{acc.balanceCurrency}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-mono text-sm font-semibold ${isNeg ? 'text-[#F87171]' : 'text-[#00D4AA]'}`}>
                        {formatCurrency(total, 'ILS')}
                      </p>
                      {acc.balanceCurrency !== 'ILS' && (
                        <p className="text-[10px] text-[#484F58] font-mono">
                          {formatCurrency(acc.balance, acc.balanceCurrency)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Investments */}
        {investments.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#484F58] uppercase tracking-widest mb-2">Investments</p>
            <div className="space-y-2">
              {investments.map((inv) => {
                const invILS = convertAmount(inv.balance, inv.currency, 'ILS', rates)
                return (
                  <div key={inv.id} className="glass-card px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C084FC]/10 border border-[#C084FC]/20 flex items-center justify-center shrink-0">
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M2 11l3-3 2 2 3.5-4.5 3 2.5" stroke="#C084FC" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#E6EDF3] truncate">{inv.name}</p>
                      <p className="text-[10px] text-[#484F58]">{inv.currency}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm font-semibold text-[#C084FC]">
                        {formatCurrency(invILS, 'ILS')}
                      </p>
                      {inv.currency !== 'ILS' && (
                        <p className="text-[10px] text-[#484F58] font-mono">
                          {formatCurrency(inv.balance, inv.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Suggestions — mobile only (desktop shows in right panel) */}
        <div className="lg:hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
            <p className="text-[10px] font-semibold text-[#484F58] uppercase tracking-widest">Suggestions</p>
          </div>
          {suggestions.length === 0 ? (
            <div className="glass-card px-4 py-3 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00D4AA]/10 flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6l2.5 2.5 5-5" stroke="#00D4AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-xs text-[#7D8590]">All accounts are healthy</p>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((s) => (
                <SuggestionPill
                  key={s.id}
                  message={s.message}
                  amount={s.amountILS}
                  color={SUGGESTION_COLORS[s.type]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
