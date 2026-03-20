import type { Suggestion } from '../../lib/recommendations'
import { formatCurrency } from '../../lib/formatters'

interface RecommendationCardProps {
  suggestion: Suggestion
}

const TYPE_CONFIG: Record<Suggestion['type'], { color: string; glyph: string }> = {
  transfer:            { color: '#00D4AA', glyph: '→' },
  savings_withdrawal:  { color: '#58A6FF', glyph: '↓' },
  deposit_withdrawal:  { color: '#C084FC', glyph: '↓' },
  liquidation:         { color: '#F59E0B', glyph: '⬡' },
}

function PlainMessage({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <p className="text-xs text-[#7D8590] leading-relaxed">
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} className="text-[#B0BAC6] font-semibold">{part}</strong>
          : part
      )}
    </p>
  )
}

export function RecommendationCard({ suggestion }: RecommendationCardProps) {
  const { color, glyph } = TYPE_CONFIG[suggestion.type]

  return (
    <div
      className="rounded-xl px-4 py-3 space-y-2.5 animate-fade-in"
      style={{
        background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)`,
        border: `1px solid ${color}20`,
      }}
    >
      {/* Top row: glyph + amount */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
          style={{ color, background: `${color}18` }}
        >
          {glyph}
        </span>
        <span
          className="font-mono text-sm font-semibold"
          style={{ color }}
        >
          {formatCurrency(suggestion.amountILS, 'ILS')}
        </span>
      </div>

      {/* Message */}
      <PlainMessage text={suggestion.message} />
    </div>
  )
}
