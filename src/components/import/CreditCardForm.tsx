import { useState } from 'react'
import type { CreditCard, BankAccount } from '../../store/useFinanceStore'

const CARD_COLORS = ['#00C896', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#10B981', '#6366F1']

interface Props {
  accounts: BankAccount[]
  initial?: CreditCard
  onSubmit: (data: Omit<CreditCard, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

export function CreditCardForm({ accounts, initial, onSubmit, onCancel }: Props) {
  const [name, setName]             = useState(initial?.name ?? '')
  const [linkedId, setLinkedId]     = useState(initial?.linkedBankAccountId ?? (accounts[0]?.id ?? ''))
  const [color, setColor]           = useState(initial?.color ?? CARD_COLORS[0])
  const [error, setError]           = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Card name is required'); return }
    if (!linkedId)    { setError('Select a linked account'); return }
    onSubmit({ name: name.trim(), linkedBankAccountId: linkedId, color })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">Card Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null) }}
          placeholder='e.g. "Visa Leumi"'
          className="w-full text-sm px-3 py-2 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 text-[#111827] placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* Linked account */}
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">Linked Bank Account</label>
        <select
          value={linkedId}
          onChange={(e) => setLinkedId(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#00C896]/40"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        {accounts.length === 0 && (
          <p className="text-[10px] text-[#F59E0B] mt-1">Add a bank account first</p>
        )}
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {CARD_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full transition-transform active:scale-95"
              style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-[#EF4444]">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={accounts.length === 0}
          className="flex-1 py-2.5 rounded-xl bg-[#00C896] text-white text-sm font-semibold hover:bg-[#00B589] transition-colors disabled:opacity-50"
        >
          {initial ? 'Save' : 'Add Card'}
        </button>
      </div>
    </form>
  )
}
