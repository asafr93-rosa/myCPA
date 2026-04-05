import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { CreditCard, BankAccount } from '../../store/useFinanceStore'
import { CreditCardForm } from './CreditCardForm'

interface Props {
  open: boolean
  onClose: () => void
  accounts: BankAccount[]
  initial?: CreditCard
  onSubmit: (data: Omit<CreditCard, 'id' | 'createdAt'>) => void
}

export function CreditCardDrawer({ open, onClose, accounts, initial, onSubmit }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col animate-slide-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6] shrink-0">
          <h2 className="text-sm font-semibold text-[#111827]">{initial ? 'Edit Card' : 'Add Credit Card'}</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#374151] transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <CreditCardForm
            accounts={accounts}
            initial={initial}
            onSubmit={(data) => { onSubmit(data); onClose() }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
