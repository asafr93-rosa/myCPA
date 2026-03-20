import { useState } from 'react'
import { useFinanceStore } from '../store/useFinanceStore'
import type { BankAccount } from '../store/useFinanceStore'
import { AccountCard } from '../components/accounts/AccountCard'
import { AccountDrawer } from '../components/accounts/AccountDrawer'
import { Button } from '../components/ui/Button'
import toast from 'react-hot-toast'

export function BankAccounts() {
  const accounts = useFinanceStore((s) => s.accounts)
  const addAccount = useFinanceStore((s) => s.addAccount)
  const updateAccount = useFinanceStore((s) => s.updateAccount)
  const deleteAccount = useFinanceStore((s) => s.deleteAccount)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)

  const handleAdd = (data: Omit<BankAccount, 'id' | 'createdAt'>) => {
    addAccount(data)
    setDrawerOpen(false)
    toast.success('Account added')
  }

  const handleEdit = (data: Omit<BankAccount, 'id' | 'createdAt'>) => {
    if (!editingAccount) return
    updateAccount(editingAccount.id, data)
    setEditingAccount(null)
    toast.success('Account updated')
  }

  const handleDelete = (id: string) => {
    deleteAccount(id)
    toast.success('Account deleted')
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[#E6EDF3]">Bank Accounts</h1>
          <p className="text-xs text-[#484F58]">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setDrawerOpen(true)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add
        </Button>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-24 md:pb-6">
        {accounts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-[#161B22] border border-white/8 flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="#7D8590" strokeWidth="1.5"/>
                <path d="M2 11h20" stroke="#7D8590" strokeWidth="1.5"/>
                <circle cx="6" cy="16" r="1" fill="#7D8590"/>
              </svg>
            </div>
            <h2 className="text-sm font-medium text-[#E6EDF3] mb-1.5">No accounts yet</h2>
            <p className="text-xs text-[#7D8590] mb-4">Add bank accounts to start tracking</p>
            <Button variant="primary" size="sm" onClick={() => setDrawerOpen(true)}>Add First Account</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={() => setEditingAccount(account)}
                onDelete={() => handleDelete(account.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AccountDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleAdd}
      />
      <AccountDrawer
        open={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        onSubmit={handleEdit}
        initial={editingAccount ?? undefined}
      />
    </div>
  )
}
