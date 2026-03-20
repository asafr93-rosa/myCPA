import { useMemo } from 'react'
import { useFinanceStore, computeTotalBalance } from '../store/useFinanceStore'
import { AnimatedCounter } from '../components/ui/AnimatedCounter'
import { formatCurrency, convertAmount } from '../lib/formatters'
import { Link } from 'react-router-dom'

function KPICard({ label, value, isNegative = false }: {
  label: string; value: number; isNegative?: boolean
}) {
  return (
    <div className="glass-card p-5 flex flex-col gap-1">
      <span className="text-xs font-medium text-[#7D8590] uppercase tracking-wider">{label}</span>
      <AnimatedCounter
        value={value}
        currency="ILS"
        className={`text-2xl font-semibold ${isNegative ? 'text-[#F87171]' : 'text-[#E6EDF3]'}`}
      />
    </div>
  )
}

export function Dashboard() {
  const accounts = useFinanceStore((s) => s.accounts)
  const investments = useFinanceStore((s) => s.investments)
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

  const negativeAccounts = accounts.filter((a) => computeTotalBalance(a, rates) < 0)

  if (accounts.length === 0 && investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#161B22] border border-white/8 flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#7D8590" strokeWidth="1.5"/>
            <path d="M9 22V12h6v10" stroke="#7D8590" strokeWidth="1.5"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[#E6EDF3] mb-2">No data yet</h2>
        <p className="text-sm text-[#7D8590] mb-6">Add bank accounts or investments to get started</p>
        <Link to="/accounts" className="text-sm font-medium text-[#00D4AA] hover:underline">
          Add account →
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF3]">Dashboard</h1>
        <p className="text-sm text-[#7D8590]">Overview — all amounts in ILS ₪</p>
      </div>

      {/* Warning banners */}
      {negativeAccounts.length > 0 && (
        <div className="space-y-2">
          {negativeAccounts.map((acc) => (
            <div key={acc.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F87171]/8 border border-[#F87171]/20">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="#F87171" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 6v3.5" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="11.5" r="0.75" fill="#F87171"/>
              </svg>
              <span className="text-sm text-[#F87171]">
                <strong>{acc.name}</strong> — negative balance ({formatCurrency(computeTotalBalance(acc, rates), 'ILS')})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Net Worth" value={totals.netWorth} isNegative={totals.netWorth < 0} />
        <KPICard label="Liquid Balance" value={totals.liquid} isNegative={totals.liquid < 0} />
        <KPICard label="Deposits" value={totals.deposits} />
        <KPICard label="Investments" value={totals.inv} />
      </div>

      {/* Account Summary */}
      {accounts.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-[#7D8590] uppercase tracking-wider mb-3">Bank Accounts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accounts.map((acc) => {
              const total = computeTotalBalance(acc, rates)
              const isNeg = total < 0
              return (
                <div key={acc.id} className="glass-card p-4 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-[#0D1117] font-bold text-sm"
                    style={{ background: acc.color }}
                  >
                    {acc.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#E6EDF3] truncate">{acc.name}</p>
                    <p className="text-xs text-[#7D8590]">{acc.balanceCurrency}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-mono text-sm font-semibold ${isNeg ? 'text-[#F87171]' : 'text-[#00D4AA]'}`}>
                      {formatCurrency(total, 'ILS')}
                    </p>
                    {acc.balanceCurrency !== 'ILS' && (
                      <p className="text-[10px] text-[#484F58] font-mono">
                        ≈ {formatCurrency(acc.balance, acc.balanceCurrency)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Investments Summary */}
      {investments.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-[#7D8590] uppercase tracking-wider mb-3">Investments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {investments.map((inv) => {
              const invILS = convertAmount(inv.balance, inv.currency, 'ILS', rates)
              return (
                <div key={inv.id} className="glass-card p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#C084FC]/10 border border-[#C084FC]/20 flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M2 12l3-3 2 2 3.5-4.5 3 2.5" stroke="#C084FC" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#E6EDF3] truncate">{inv.name}</p>
                    <p className="text-xs text-[#7D8590]">{inv.currency}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm font-semibold text-[#C084FC]">
                      {formatCurrency(invILS, 'ILS')}
                    </p>
                    {inv.currency !== 'ILS' && (
                      <p className="text-[10px] text-[#484F58] font-mono">
                        ≈ {formatCurrency(inv.balance, inv.currency)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
