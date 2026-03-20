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
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EDF3]">Bank Accounts</h1>
          <p className="text-sm text-[#7D8590]">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setDrawerOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#161B22] border border-white/8 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="14" rx="2" stroke="#7D8590" strokeWidth="1.5"/>
              <path d="M2 11h20" stroke="#7D8590" strokeWidth="1.5"/>
              <circle cx="6" cy="16" r="1" fill="#7D8590"/>
            </svg>
          </div>
          <h2 className="text-base font-medium text-[#E6EDF3] mb-2">No accounts yet</h2>
          <p className="text-sm text-[#7D8590] mb-5">Add bank accounts to start tracking</p>
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
