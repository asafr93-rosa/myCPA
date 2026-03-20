import { useState } from 'react'
import { useFinanceStore } from '../store/useFinanceStore'
import type { Investment } from '../store/useFinanceStore'
import { InvestmentCard } from '../components/investments/InvestmentCard'
import { InvestmentModal } from '../components/investments/InvestmentModal'
import { Button } from '../components/ui/Button'
import { AnimatedCounter } from '../components/ui/AnimatedCounter'
import toast from 'react-hot-toast'

export function Investments() {
  const investments = useFinanceStore((s) => s.investments)
  const addInvestment = useFinanceStore((s) => s.addInvestment)
  const updateInvestment = useFinanceStore((s) => s.updateInvestment)
  const deleteInvestment = useFinanceStore((s) => s.deleteInvestment)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)

  const total = investments.reduce((s, i) => s + i.balance, 0)

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

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EDF3]">Investments</h1>
          <p className="text-sm text-[#7D8590]">{investments.length} portfolio item{investments.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add Investment
        </Button>
      </div>

      {/* Total summary */}
      {investments.length > 0 && (
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#C084FC]/10 border border-[#C084FC]/20 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 14l4-4 3 2 4-5 3 2" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-[#7D8590] uppercase tracking-wider mb-0.5">Total Portfolio Value</p>
            <AnimatedCounter value={total} className="text-2xl font-semibold text-[#E6EDF3]" />
          </div>
        </div>
      )}

      {investments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#161B22] border border-white/8 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 20l6-6 4 3 5-7 4 3" stroke="#7D8590" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 8v4h-4" stroke="#7D8590" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-base font-medium text-[#E6EDF3] mb-2">No investments yet</h2>
          <p className="text-sm text-[#7D8590] mb-5">Track your portfolio by adding investments</p>
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>Add First Investment</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {investments.map((inv) => (
            <InvestmentCard
              key={inv.id}
              investment={inv}
              onEdit={() => setEditingInvestment(inv)}
              onDelete={() => handleDelete(inv.id)}
            />
          ))}
        </div>
      )}

      <InvestmentModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
      <InvestmentModal
        open={!!editingInvestment}
        onClose={() => setEditingInvestment(null)}
        onSubmit={handleEdit}
        initial={editingInvestment ?? undefined}
      />
    </div>
  )
}
