import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { autoFormatInput, parseFormattedNumber } from '../../lib/formatters'
import type { Investment } from '../../store/useFinanceStore'

interface LogValueModalProps {
  open: boolean
  onClose: () => void
  investment: Investment
  onSubmit: (value: number, recordedAt: string, note: string) => void
}

export function LogValueModal({ open, onClose, investment, onSubmit }: LogValueModalProps) {
  const [value, setValue] = useState(autoFormatInput(String(investment.balance)))
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFormattedNumber(value)
    if (!num) { setError('Enter a valid value'); return }
    onSubmit(num, new Date(date).toISOString(), note.trim())
    setValue(''); setNote(''); setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Log Value — ${investment.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider block">New Value</label>
          <div className="flex gap-1.5">
            <input
              autoFocus
              inputMode="decimal"
              placeholder="0.00"
              value={value}
              onChange={(e) => { setValue(autoFormatInput(e.target.value)); setError('') }}
              className={`flex-1 bg-[#0D1117] border rounded-lg px-3 py-2 text-sm text-[#E6EDF3] font-mono placeholder:text-[#484F58] outline-none transition-colors ${
                error ? 'border-[#F87171]/50' : 'border-white/10 focus:border-[#00D4AA]/50'
              }`}
            />
            <span className="bg-[#161B22] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#7D8590] flex items-center">
              {investment.currency}
            </span>
          </div>
          {error && <p className="text-xs text-[#F87171]">{error}</p>}
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider block">Date</label>
          <input
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E6EDF3] outline-none focus:border-[#00D4AA]/50 transition-colors"
          />
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider block">Note (optional)</label>
          <input
            placeholder="e.g. End of Q1 2026"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E6EDF3] placeholder:text-[#484F58] outline-none focus:border-[#00D4AA]/50 transition-colors"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1">Log Value</Button>
        </div>
      </form>
    </Modal>
  )
}
