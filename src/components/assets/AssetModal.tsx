import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { autoFormatInput, parseFormattedNumber } from '../../lib/formatters'
import type { Asset, AssetCategory } from '../../store/useFinanceStore'

const FIELD_CURRENCIES = ['ILS', 'USD', 'EUR', 'GBP']

const CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' },
]

interface AssetModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Asset, 'id' | 'createdAt'>) => void
  initial?: Partial<Asset>
}

export function AssetModal({ open, onClose, onSubmit, initial }: AssetModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [value, setValue] = useState(
    initial?.value !== undefined ? autoFormatInput(String(initial.value)) : ''
  )
  const [currency, setCurrency] = useState(initial?.currency ?? 'ILS')
  const [category, setCategory] = useState<AssetCategory>(initial?.category ?? 'real_estate')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [errors, setErrors] = useState<{ name?: string; value?: string }>({})

  const validate = () => {
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = 'Name required'
    if (!value) errs.value = 'Value required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ name: name.trim(), value: parseFormattedNumber(value), currency, category, description: description.trim() })
    setName(''); setValue(''); setCurrency('ILS'); setCategory('real_estate'); setDescription(''); setErrors({})
  }

  return (
    <Modal open={open} onClose={onClose} title={initial?.name ? 'Edit Asset' : 'Add Asset'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Asset Name"
          placeholder="e.g. Apartment Tel Aviv"
          value={name}
          onChange={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })) }}
          error={errors.name}
        />

        {/* Category picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider block">Category</label>
          <div className="flex gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                  category === c.value
                    ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30'
                    : 'bg-[#161B22] text-[#7D8590] border border-white/8 hover:border-white/20'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Value + currency */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider block">Value</label>
          <div className="flex gap-1.5">
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={value}
              onChange={(e) => {
                setValue(autoFormatInput(e.target.value))
                setErrors((err) => ({ ...err, value: undefined }))
              }}
              className={`flex-1 bg-[#0D1117] border rounded-lg px-3 py-2 text-sm text-[#E6EDF3] font-mono placeholder:text-[#484F58] outline-none transition-colors ${
                errors.value ? 'border-[#F87171]/50' : 'border-white/10 focus:border-[#00D4AA]/50'
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
          {errors.value && <p className="text-xs text-[#F87171]">{errors.value}</p>}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of this asset..."
            rows={2}
            className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E6EDF3] placeholder:text-[#484F58] outline-none focus:border-[#00D4AA]/50 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1">
            {initial?.name ? 'Save' : 'Add Asset'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
