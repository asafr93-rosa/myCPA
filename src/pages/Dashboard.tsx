import { useMemo, type ReactNode } from 'react'
import { useFinanceStore, computeTotalBalance } from '../store/useFinanceStore'
import { AnimatedCounter } from '../components/ui/AnimatedCounter'
import { formatCurrency, convertAmount } from '../lib/formatters'
import { computeRecommendations } from '../lib/recommendations'
import { portfolioWeightedReturn, totalReturnPct } from '../lib/investmentMetrics'
import { Link, useNavigate } from 'react-router-dom'

function KPICard({ label, value, currency, isNegative = false, hero = false, compact = false, children }: {
  label: string; value: number; currency: string; isNegative?: boolean; hero?: boolean; compact?: boolean; children?: ReactNode
}) {
  return (
    <div className={`glass-card flex flex-col min-w-0 overflow-hidden ${hero ? 'px-5 py-4 gap-1' : 'px-4 py-3 gap-0.5'}`}>
      <span className="section-label">{label}</span>
      <AnimatedCounter
        value={value}
        currency={currency}
        compact={compact}
        className={`font-mono font-bold truncate ${hero ? 'text-2xl' : 'text-base'} ${isNegative ? 'text-[#F43F5E]' : 'text-[#111827]'}`}
      />
      {children}
    </div>
  )
}

function SuggestionPill({ message, amount, color }: { message: string; amount: number; color: string }) {
  const parts = message.split(/\*\*(.+?)\*\*/g)
  return (
    <div className="glass-card flex items-stretch gap-0 overflow-hidden animate-fade-in">
      <div className="w-1 shrink-0 rounded-l-2xl" style={{ background: color }} />
      <div className="flex-1 min-w-0 flex items-start gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#6B7280] leading-relaxed">
            {parts.map((part, i) =>
              i % 2 === 1
                ? <strong key={i} className="text-[#111827] font-semibold">{part}</strong>
                : part
            )}
          </p>
        </div>
        <span className="font-mono text-xs font-bold shrink-0" style={{ color }}>
          {formatCurrency(amount, 'ILS')}
        </span>
      </div>
    </div>
  )
}

const SUGGESTION_COLORS = {
  transfer: '#00C896',
  savings_withdrawal: '#3B82F6',
  deposit_withdrawal: '#7C3AED',
  liquidation: '#F43F5E',
}

export function Dashboard() {
  const navigate = useNavigate()
  const accounts = useFinanceStore((s) => s.accounts)
  const investments = useFinanceStore((s) => s.investments)
  const assets = useFinanceStore((s) => s.assets)
  const priorityConfig = useFinanceStore((s) => s.priorityConfig)
  const settings = useFinanceStore((s) => s.settings)
  const rates = settings.exchangeRates
  const displayCurrency = settings.displayCurrency

  const snapshots = useFinanceStore((s) => s.snapshots)

  const totals = useMemo(() => {
    const liquidILS = accounts.reduce((s, a) => s + computeTotalBalance(a, rates), 0)
    const depositsILS = accounts.reduce(
      (s, a) => s + convertAmount(a.deposits, a.depositsCurrency, 'ILS', rates), 0
    )
    const stocksILS = accounts.reduce(
      (s, a) => s + convertAmount(a.stockBalance, a.stockCurrency, 'ILS', rates), 0
    )
    const invILS = investments.reduce(
      (s, i) => s + convertAmount(i.balance, i.currency, 'ILS', rates), 0
    )
    const assetsILS = assets.reduce(
      (s, a) => s + convertAmount(a.value, a.currency, 'ILS', rates), 0
    )
    const netWorthILS = liquidILS + depositsILS + stocksILS + invILS + assetsILS
    const toDisplay = (v: number) => convertAmount(v, 'ILS', displayCurrency, rates)
    return {
      netWorth: toDisplay(netWorthILS),
      liquid: toDisplay(liquidILS),
      deposits: toDisplay(depositsILS),
      inv: toDisplay(invILS),
      assets: toDisplay(assetsILS),
    }
  }, [accounts, investments, assets, rates, displayCurrency])

  const portfolioReturn = useMemo(
    () => portfolioWeightedReturn(snapshots, investments.map((i) => i.id)),
    [snapshots, investments]
  )

  const suggestions = useMemo(
    () => computeRecommendations(accounts, investments, priorityConfig, rates),
    [accounts, investments, priorityConfig, rates]
  )

  if (accounts.length === 0 && investments.length === 0 && assets.length === 0) {
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
      {/* Single scrollable area — everything scrolls together */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-24 md:pb-6 space-y-4">

        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-[#111827] leading-tight">Overview</h1>
          <p className="text-xs text-[#9CA3AF]">All amounts in {displayCurrency}</p>
        </div>

        {/* Net Worth hero */}
        <KPICard label="Net Worth" value={totals.netWorth} currency={displayCurrency} isNegative={totals.netWorth < 0} hero />

        {/* KPI grid — compact numbers fit half-width cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <KPICard label="Liquid" value={totals.liquid} currency={displayCurrency} isNegative={totals.liquid < 0} compact />
          <KPICard label="Deposits" value={totals.deposits} currency={displayCurrency} compact />
          <div className="glass-card px-4 py-3 flex flex-col gap-0.5 min-w-0 overflow-hidden">
            <span className="section-label">Investments</span>
            <AnimatedCounter value={totals.inv} currency={displayCurrency} className="text-base font-bold font-mono text-[#111827] truncate" compact />
            {portfolioReturn !== null && (
              <span className={`text-[10px] font-mono font-semibold ${portfolioReturn >= 0 ? 'text-[#00C896]' : 'text-[#F43F5E]'}`}>
                {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(1)}%
              </span>
            )}
          </div>
          <KPICard label="Assets" value={totals.assets} currency={displayCurrency} compact />
        </div>

        {/* Suggestions — mobile only; desktop shows in right panel */}
        <div className="lg:hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
            <p className="section-label">Suggestions</p>
          </div>
          {suggestions.length === 0 ? (
            <div className="glass-card px-4 py-3 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00C896]/10 flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6l2.5 2.5 5-5" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-xs text-[#6B7280]">All accounts are healthy</p>
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
            <p className="section-label mb-2">Bank Accounts</p>
            <div className="space-y-2">
              {accounts.map((acc) => {
                const total = computeTotalBalance(acc, rates)
                const isNeg = total < 0
                return (
                  <div
                    key={acc.id}
                    onClick={() => navigate('/accounts', { state: { scrollTo: acc.id } })}
                    className="glass-card px-4 py-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                  >
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
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#484F58]">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Investments */}
        {investments.length > 0 && (
          <div>
            <p className="section-label mb-2">Investments</p>
            <div className="space-y-2">
              {investments.map((inv) => {
                const invILS = convertAmount(inv.balance, inv.currency, 'ILS', rates)
                return (
                  <div
                    key={inv.id}
                    onClick={() => navigate('/investments', { state: { scrollTo: inv.id } })}
                    className="glass-card px-4 py-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                  >
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
                      {(() => {
                        const ret = totalReturnPct(snapshots, inv.id)
                        if (ret === null) return null
                        return (
                          <p className={`text-[10px] font-mono font-semibold ${ret >= 0 ? 'text-[#00D4AA]' : 'text-[#F87171]'}`}>
                            {ret >= 0 ? '+' : ''}{ret.toFixed(1)}%
                          </p>
                        )
                      })()}
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#484F58]">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Assets */}
        {assets.length > 0 && (
          <div>
            <p className="section-label mb-2">Assets</p>
            <div className="space-y-2">
              {assets.map((asset) => {
                const assetILS = convertAmount(asset.value, asset.currency, 'ILS', rates)
                return (
                  <div
                    key={asset.id}
                    onClick={() => navigate('/assets', { state: { scrollTo: asset.id } })}
                    className="glass-card px-4 py-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M1 13V7l6-4.5L13 7v6H1z" stroke="#3B82F6" strokeWidth="1.3" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#E6EDF3] truncate">{asset.name}</p>
                      <p className="text-[10px] text-[#484F58] capitalize">{asset.category.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm font-semibold text-[#3B82F6]">
                        {formatCurrency(assetILS, 'ILS')}
                      </p>
                      {asset.currency !== 'ILS' && (
                        <p className="text-[10px] text-[#484F58] font-mono">
                          {formatCurrency(asset.value, asset.currency)}
                        </p>
                      )}
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#484F58]">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
