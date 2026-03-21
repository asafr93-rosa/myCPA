import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { autoFormatInput, parseFormattedNumber } from '../../lib/formatters'
import type { Investment } from '../../store/useFinanceStore'

const FIELD_CURRENCIES = ['ILS', 'USD', 'EUR', 'GBP']

interface InvestmentModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Investment, 'id' | 'createdAt'>) => void
  initial?: Partial<Investment>
}

export function InvestmentModal({ open, onClose, onSubmit, initial }: InvestmentModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [balance, setBalance] = useState(
    initial?.balance !== undefined ? autoFormatInput(String(initial.balance)) : ''
  )
  const [currency, setCurrency] = useState(initial?.currency ?? 'USD')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [errors, setErrors] = useState<{ name?: string; balance?: string }>({})

  const isEdit = !!initial?.name

  const validate = () => {
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = 'Name required'
    if (!isEdit && !balance) errs.balance = 'Value required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ name: name.trim(), balance: parseFormattedNumber(balance), currency, description: description.trim() })
    setName(''); setBalance(''); setCurrency('USD'); setDescription(''); setErrors({})
  }

  return (
    <Modal open={open} onClose={onClose} title={initial?.name ? 'Edit Investment' : 'Add Investment'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Investment Name"
          placeholder="e.g. S&P 500 ETF"
          value={name}
          onChange={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })) }}
          error={errors.name}
        />

        {/* Value + currency — only shown when adding, not editing */}
        {!isEdit && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider block">Current Value</label>
            <div className="flex gap-1.5">
              <input
                placeholder="0.00"
                value={balance}
                onChange={(e) => {
                  const v = autoFormatInput(e.target.value)
                  setBalance(v)
                  setErrors((err) => ({ ...err, balance: undefined }))
                }}
                className={`flex-1 bg-[#0D1117] border rounded-lg px-3 py-2 text-sm text-[#E6EDF3] font-mono placeholder:text-[#484F58] outline-none transition-colors ${
                  errors.balance ? 'border-[#F87171]/50' : 'border-white/10 focus:border-[#00D4AA]/50'
                }`}
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-[#0D1117] border border-white/10 rounded-lg px-2 py-2 text-xs text-[#7D8590] outline-none focus:border-[#00D4AA]/50 transition-colors w-16"
              >
                {FIELD_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {errors.balance && <p className="text-xs text-[#F87171]">{errors.balance}</p>}
          </div>
        )}
        {isEdit && (
          <p className="text-xs text-[#484F58] bg-[#161B22] border border-white/8 rounded-lg px-3 py-2">
            Use "Log Value" on the card to update the balance.
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of this investment..."
            rows={3}
            className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E6EDF3] placeholder:text-[#484F58] outline-none focus:border-[#00D4AA]/50 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1">
            {initial?.name ? 'Save' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
