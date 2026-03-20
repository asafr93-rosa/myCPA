import { createPortal } from 'react-dom'
import { AccountForm } from './AccountForm'
import type { BankAccount } from '../../store/useFinanceStore'
import { useEffect } from 'react'

interface AccountDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<BankAccount, 'id' | 'createdAt'>) => void
  initial?: Partial<BankAccount>
}

export function AccountDrawer({ open, onClose, onSubmit, initial }: AccountDrawerProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-[#161B22] border-l border-white/10 shadow-2xl flex flex-col animate-slide-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
          <h2 className="text-base font-semibold text-[#E6EDF3]">
            {initial ? 'Edit Account' : 'Add Account'}
          </h2>
          <button onClick={onClose} className="text-[#7D8590] hover:text-[#E6EDF3] transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <AccountForm initial={initial} onSubmit={onSubmit} onCancel={onClose} />
        </div>
      </div>
    </div>,
    document.body
  )
}
