import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useFinanceStore } from '../store/useFinanceStore'
import type { Asset } from '../store/useFinanceStore'
import { AssetCard } from '../components/assets/AssetCard'
import { AssetModal } from '../components/assets/AssetModal'
import { Button } from '../components/ui/Button'
import { formatCurrency, convertAmount } from '../lib/formatters'
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

export function Assets() {
  useScrollToCard()
  const assets = useFinanceStore((s) => s.assets)
  const rates = useFinanceStore((s) => s.settings.exchangeRates)
  const addAsset = useFinanceStore((s) => s.addAsset)
  const updateAsset = useFinanceStore((s) => s.updateAsset)
  const deleteAsset = useFinanceStore((s) => s.deleteAsset)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  const totalILS = useMemo(
    () => assets.reduce((s, a) => s + convertAmount(a.value, a.currency, 'ILS', rates), 0),
    [assets, rates]
  )

  const handleAdd = (data: Omit<Asset, 'id' | 'createdAt'>) => {
    addAsset(data)
    setModalOpen(false)
    toast.success('Asset added')
  }

  const handleEdit = (data: Omit<Asset, 'id' | 'createdAt'>) => {
    if (!editingAsset) return
    updateAsset(editingAsset.id, data)
    setEditingAsset(null)
    toast.success('Asset updated')
  }

  const handleDelete = (id: string) => {
    deleteAsset(id)
    toast.success('Asset removed')
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[#E6EDF3]">Assets</h1>
          <p className="text-xs text-[#484F58]">{assets.length} item{assets.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add
        </Button>
      </div>

      {/* Total bar */}
      {assets.length > 0 && (
        <div className="shrink-0 mx-5 mb-3 glass-card px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 13V6l6-4.5L13 6v7H1z" stroke="#3B82F6" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-[#484F58] uppercase tracking-widest">Total Assets (ILS)</p>
            <p className="font-mono text-lg font-semibold text-[#E6EDF3]">{formatCurrency(totalILS, 'ILS')}</p>
          </div>
        </div>
      )}

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-24 md:pb-6">
        {assets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-[#161B22] border border-white/8 flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 22V10l9-7 9 7v12H3z" stroke="#7D8590" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 22v-6h6v6" stroke="#7D8590" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-sm font-medium text-[#E6EDF3] mb-1.5">No assets yet</h2>
            <p className="text-xs text-[#7D8590] mb-4">Track real estate, vehicles, and more</p>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>Add First Asset</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => (
              <div key={asset.id} id={`card-${asset.id}`}>
                <AssetCard
                  asset={asset}
                  onEdit={() => setEditingAsset(asset)}
                  onDelete={() => handleDelete(asset.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <AssetModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
      <AssetModal
        open={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        onSubmit={handleEdit}
        initial={editingAsset ?? undefined}
      />
    </div>
  )
}
