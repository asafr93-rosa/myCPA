import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useFinanceStore } from '../store/useFinanceStore'
import type { Investment } from '../store/useFinanceStore'
import { InvestmentCard } from '../components/investments/InvestmentCard'
import { InvestmentModal } from '../components/investments/InvestmentModal'
import { LogValueModal } from '../components/investments/LogValueModal'
import { InvestmentHistory } from '../components/investments/InvestmentHistory'
import { Button } from '../components/ui/Button'
import { formatCurrency, convertAmount } from '../lib/formatters'
import { portfolioWeightedReturn } from '../lib/investmentMetrics'
import toast from 'react-hot-toast'

function useScrollToCard() {
  const location = useLocation()
  useEffect(() => {
    const id = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (!id) return
    window.history.replaceState({}, '', location.pathname)
    const timer = setTimeout(() => {
      const el = document.getElementById(`card-${id}`)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.style.transition = 'box-shadow 0.3s'
      el.style.boxShadow = '0 0 0 2px rgba(0,212,170,0.6)'
      setTimeout(() => { el.style.boxShadow = '' }, 1800)
    }, 100)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

export function Investments() {
  useScrollToCard()
  const investments = useFinanceStore((s) => s.investments)
  const snapshots = useFinanceStore((s) => s.snapshots)
  const rates = useFinanceStore((s) => s.settings.exchangeRates)
  const addInvestment = useFinanceStore((s) => s.addInvestment)
  const updateInvestment = useFinanceStore((s) => s.updateInvestment)
  const deleteInvestment = useFinanceStore((s) => s.deleteInvestment)
  const addSnapshot = useFinanceStore((s) => s.addSnapshot)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [loggingInvestment, setLoggingInvestment] = useState<Investment | null>(null)
  const [historyInvestment, setHistoryInvestment] = useState<Investment | null>(null)

  const totalILS = useMemo(
    () => investments.reduce((s, i) => s + convertAmount(i.balance, i.currency, 'ILS', rates), 0),
    [investments, rates]
  )

  const weightedReturn = useMemo(
    () => portfolioWeightedReturn(snapshots, investments.map((i) => i.id)),
    [snapshots, investments]
  )

  const handleAdd = (data: Omit<Investment, 'id' | 'createdAt'>) => {
    addInvestment(data)
    setModalOpen(false)
    toast.success('Investment added')
  }

  const handleEdit = (data: Omit<Investment, 'id' | 'createdAt'>) => {
    if (!editingInvestment) return
    updateInvestment(editingInvestment.id, data)
    setEditingInvestment(null)
    toast.success('Investment updated')
  }

  const handleDelete = (id: string) => {
    deleteInvestment(id)
    toast.success('Investment removed')
  }

  const handleLogSubmit = (value: number, recordedAt: string, note: string) => {
    if (!loggingInvestment) return
    addSnapshot(loggingInvestment.id, value, loggingInvestment.currency, recordedAt, note, rates)
    toast.success('Value logged')
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[#E6EDF3]">Investments</h1>
          <p className="text-xs text-[#484F58]">{investments.length} item{investments.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add
        </Button>
      </div>

      {/* Portfolio summary bar */}
      {investments.length > 0 && (
        <div className="shrink-0 mx-5 mb-3 glass-card px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C084FC]/10 border border-[#C084FC]/20 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 11l3-3 2 2 3.5-4.5 3 2.5" stroke="#C084FC" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#484F58] uppercase tracking-widest">Portfolio Value</p>
            <p className="font-mono text-lg font-semibold text-[#E6EDF3]">{formatCurrency(totalILS, 'ILS')}</p>
          </div>
          {weightedReturn !== null && (
            <div className="text-right shrink-0">
              <p className="text-[10px] text-[#484F58] uppercase tracking-widest">Avg Return</p>
              <p className={`font-mono text-sm font-semibold ${weightedReturn >= 0 ? 'text-[#00D4AA]' : 'text-[#F87171]'}`}>
                {weightedReturn >= 0 ? '+' : ''}{weightedReturn.toFixed(2)}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-24 md:pb-6">
        {investments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-[#161B22] border border-white/8 flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 20l6-6 4 3 5-7 4 3" stroke="#7D8590" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 8v4h-4" stroke="#7D8590" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-sm font-medium text-[#E6EDF3] mb-1.5">No investments yet</h2>
            <p className="text-xs text-[#7D8590] mb-4">Track your portfolio here</p>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>Add First Investment</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {investments.map((inv) => (
              <div key={inv.id} id={`card-${inv.id}`}>
                <InvestmentCard
                  investment={inv}
                  onEdit={() => setEditingInvestment(inv)}
                  onDelete={() => handleDelete(inv.id)}
                  onLogValue={() => setLoggingInvestment(inv)}
                  onHistory={() => setHistoryInvestment(inv)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <InvestmentModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
      <InvestmentModal
        open={!!editingInvestment}
        onClose={() => setEditingInvestment(null)}
        onSubmit={handleEdit}
        initial={editingInvestment ?? undefined}
      />
      {loggingInvestment && (
        <LogValueModal
          open={!!loggingInvestment}
          onClose={() => setLoggingInvestment(null)}
          investment={loggingInvestment}
          onSubmit={handleLogSubmit}
        />
      )}
      {historyInvestment && (
        <InvestmentHistory
          open={!!historyInvestment}
          onClose={() => setHistoryInvestment(null)}
          investment={historyInvestment}
          onLogValue={() => { setHistoryInvestment(null); setLoggingInvestment(historyInvestment) }}
        />
      )}
    </div>
  )
}
