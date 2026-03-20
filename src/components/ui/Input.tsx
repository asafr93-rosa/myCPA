import React from 'react'
import { autoFormatInput, parseFormattedNumber } from '../../lib/formatters'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  autoFormat?: boolean
  onChange?: (value: string, numericValue?: number) => void
}

export function Input({ label, error, autoFormat, onChange, className = '', value, ...props }: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return
    if (autoFormat) {
      const formatted = autoFormatInput(e.target.value)
      onChange(formatted, parseFormattedNumber(formatted))
    } else {
      onChange(e.target.value)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        {...props}
        value={value}
        onChange={handleChange}
        className={`
          w-full bg-[#0D1117] border rounded-lg px-3 py-2 text-sm text-[#E6EDF3]
          placeholder:text-[#484F58] outline-none transition-all duration-150
          ${error
            ? 'border-[#F87171]/50 focus:border-[#F87171]'
            : 'border-white/10 focus:border-[#00D4AA]/50'
          }
          ${className}
        `}
      />
      {error && <span className="text-xs text-[#F87171]">{error}</span>}
    </div>
  )
}
