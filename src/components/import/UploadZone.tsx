import { useRef, useState } from 'react'
import type { CreditCard } from '../../store/useFinanceStore'

interface Props {
  card: CreditCard
  onFile: (card: CreditCard, file: File) => void
}

export function UploadZone({ card, onFile }: Props) {
  const inputRef   = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a .csv file.')
      return
    }
    onFile(card, file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors flex flex-col items-center gap-2 ${
        dragging ? 'border-[#00C896] bg-[#00C896]/05' : 'border-[#E5E7EB] hover:border-[#00C896]/50 hover:bg-[#F9FAFB]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#9CA3AF]">
        <path d="M12 3v10m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <div className="text-center">
        <p className="text-xs font-medium text-[#374151]">Drop CSV here or click to browse</p>
        <p className="text-[10px] text-[#9CA3AF] mt-0.5">.csv files only</p>
      </div>
    </div>
  )
}
