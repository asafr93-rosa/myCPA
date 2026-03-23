import { useEffect, useRef, useState } from 'react'
import { formatCurrency, formatCompact } from '../../lib/formatters'

interface AnimatedCounterProps {
  value: number
  currency?: string
  duration?: number
  className?: string
  compact?: boolean
}

export function AnimatedCounter({ value, currency = 'USD', duration = 800, className = '', compact = false }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const prevValue = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const start = prevValue.current
    const end = value
    const startTime = performance.now()

    const update = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + (end - start) * eased)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(update)
      } else {
        prevValue.current = end
      }
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(update)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return (
    <span className={`font-mono ${className}`}>
      {compact ? formatCompact(display, currency) : formatCurrency(display, currency)}
    </span>
  )
}
