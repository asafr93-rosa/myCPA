import { useState } from 'react'
import { createPortal } from 'react-dom'

type FieldKey = 'date' | 'businessName' | 'amount' | 'currency'

interface Props {
  rawHeaders: string[]
  sampleRow: string[]
  onConfirm: (mapping: Record<FieldKey, number>) => void
  onCancel: () => void
}

const FIELDS: Array<{ key: FieldKey; label: string; required: boolean }> = [
  { key: 'date',         label: 'Transaction Date', required: true },
  { key: 'businessName', label: 'Business Name',    required: true },
  { key: 'amount',       label: 'Amount',           required: true },
  { key: 'currency',     label: 'Currency',         required: false },
]

export function ColumnMapperModal({ rawHeaders, sampleRow, onConfirm, onCancel }: Props) {
  const [mapping, setMapping] = useState<Partial<Record<FieldKey, number>>>({})
  const [error, setError]     = useState<string | null>(null)

  function handleConfirm() {
    const missing = FIELDS.filter((f) => f.required && mapping[f.key] === undefined)
    if (missing.length) {
      setError(`Please map: ${missing.map((f) => f.label).join(', ')}`)
      return
    }
    onConfirm(mapping as Record<FieldKey, number>)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
        <h2 className="text-base font-semibold text-[#111827] mb-1">Map Columns</h2>
        <p className="text-xs text-[#6B7280] mb-4">We couldn't auto-detect the columns. Please assign each field manually.</p>

        {/* Sample row preview */}
        {sampleRow.length > 0 && (
          <div className="mb-4 overflow-x-auto">
            <p className="text-[10px] text-[#9CA3AF] mb-1">Sample row from your file:</p>
            <div className="flex gap-1.5 flex-wrap">
              {rawHeaders.map((h, i) => (
                <div key={i} className="flex flex-col min-w-[64px]">
                  <span className="text-[10px] font-semibold text-[#374151] bg-[#F3F4F6] px-1.5 py-0.5 rounded-t">{h || `Col ${i + 1}`}</span>
                  <span className="text-[10px] text-[#6B7280] bg-white border border-[#F3F4F6] px-1.5 py-0.5 rounded-b truncate max-w-[80px]">{sampleRow[i] ?? ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {FIELDS.map(({ key, label, required }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-xs font-medium text-[#374151] shrink-0">
                {label} {required && <span className="text-[#EF4444]">*</span>}
              </label>
              <select
                value={mapping[key] ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  setMapping((prev) => v === '' ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)) : { ...prev, [key]: Number(v) })
                  setError(null)
                }}
                className="text-xs px-2 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#374151] focus:outline-none min-w-[140px]"
              >
                <option value="">— select column —</option>
                {rawHeaders.map((h, i) => (
                  <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {error && <p className="text-xs text-[#EF4444] mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-[#00C896] text-white text-sm font-semibold hover:bg-[#00B589] transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
