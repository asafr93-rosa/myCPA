import { useState } from 'react'
import { useFinanceStore } from '../store/useFinanceStore'
import { getAIAdvice, type AIAdviceResponse, type AIAction } from '../lib/anthropic'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { formatCurrency } from '../lib/formatters'

const ACTION_COLORS: Record<AIAction['type'], string> = {
  transfer: '#00D4AA',
  withdraw: '#3B82F6',
  liquidate: '#F87171',
  deposit: '#00D4AA',
  other: '#58A6FF',
}

function ActionCard({ action }: { action: AIAction }) {
  const color = ACTION_COLORS[action.type]
  return (
    <div className="glass-card px-4 py-3 space-y-2">
      <div className="flex items-center gap-2.5">
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-[#0D1117] shrink-0"
          style={{ background: color }}
        >
          {action.step}
        </span>
        <span className="text-xs font-medium capitalize" style={{ color }}>{action.type}</span>
        <span className="font-mono text-sm font-semibold text-[#E6EDF3] ml-auto">
          {formatCurrency(action.amount)}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-[#7D8590]">
        <span className="truncate">{action.source}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
          <path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="truncate text-[#E6EDF3]">{action.destination}</span>
      </div>
      {action.rationale && (
        <p className="text-xs text-[#484F58] leading-relaxed border-t border-white/5 pt-2">{action.rationale}</p>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton width="w-5" height="h-5" className="rounded-full" />
            <Skeleton width="w-24" height="h-3" />
            <Skeleton width="w-16" height="h-3" className="ml-auto" />
          </div>
          <Skeleton width="w-40" height="h-3" />
        </div>
      ))}
    </div>
  )
}

export function AIAdvisor() {
  const accounts = useFinanceStore((s) => s.accounts)
  const investments = useFinanceStore((s) => s.investments)
  const priorityConfig = useFinanceStore((s) => s.priorityConfig)
  const rates = useFinanceStore((s) => s.settings.exchangeRates)

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIAdviceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await getAIAdvice(accounts, investments, priorityConfig, input.trim(), rates)
      setResult(response)
    } catch (err: any) {
      setError(err.message === 'MISSING_API_KEY'
        ? 'API key not configured. Add VITE_ANTHROPIC_API_KEY to your .env file.'
        : err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!apiKey) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 pb-20 md:pb-0">
        <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center mb-3">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L20 18H2L11 2z" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M11 9v4" stroke="#3B82F6" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="11" cy="15.5" r="0.8" fill="#3B82F6"/>
          </svg>
        </div>
        <h2 className="text-sm font-semibold text-[#E6EDF3] mb-1.5">API Key Required</h2>
        <p className="text-xs text-[#7D8590] max-w-xs">
          Add <code className="text-[#00D4AA] font-mono">VITE_ANTHROPIC_API_KEY</code> to your <code className="text-[#00D4AA] font-mono">.env</code> file and restart.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-4">
        <h1 className="text-base font-semibold text-[#E6EDF3]">AI Advisor</h1>
        <p className="text-xs text-[#484F58]">Describe your financial goal</p>
      </div>

      {/* Input area — fixed */}
      <div className="shrink-0 px-5 pb-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I want to buy a car for ₪90,000"
            className="flex-1 bg-[#161B22] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#E6EDF3] placeholder:text-[#484F58] outline-none focus:border-[#00D4AA]/40 transition-colors"
            disabled={loading}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M12 7H2M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </Button>
        </form>
      </div>

      {/* Results — scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-24 md:pb-6 space-y-3">
        {loading && <LoadingSkeleton />}

        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#F87171]/8 border border-[#F87171]/20">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
              <circle cx="7" cy="7" r="6" stroke="#F87171" strokeWidth="1.2"/>
              <path d="M7 4.5v3" stroke="#F87171" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="7" cy="9.5" r="0.6" fill="#F87171"/>
            </svg>
            <p className="text-xs text-[#F87171]">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-3 animate-fade-in">
            <div className="glass-card px-4 py-3">
              <p className="text-[10px] text-[#484F58] uppercase tracking-widest mb-1.5">Summary</p>
              <p className="text-sm text-[#E6EDF3] leading-relaxed">{result.summary}</p>
            </div>

            {result.actions?.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-[#484F58] uppercase tracking-widest px-1">Action Plan</p>
                {result.actions.map((action, i) => (
                  <ActionCard key={i} action={action} />
                ))}
              </div>
            )}

            {result.warnings?.length > 0 && (
              <div className="glass-card px-4 py-3 space-y-2">
                <p className="text-[10px] font-semibold text-[#3B82F6] uppercase tracking-widest">Warnings</p>
                <ul className="space-y-1.5">
                  {result.warnings.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#7D8590]">
                      <span className="text-[#3B82F6] mt-0.5">•</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.alternatives?.length > 0 && (
              <div className="glass-card px-4 py-3 space-y-2">
                <p className="text-[10px] font-semibold text-[#00D4AA] uppercase tracking-widest">Alternatives</p>
                <ul className="space-y-1.5">
                  {result.alternatives.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#7D8590]">
                      <span className="text-[#00D4AA] mt-0.5">•</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!loading && !result && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-[#161B22] border border-white/8 flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7.5" stroke="#484F58" strokeWidth="1.5"/>
                <path d="M6.5 7.5C6.5 6.12 7.62 5 9 5s2.5 1.12 2.5 2.5c0 1.5-1.5 2.5-2.5 2.5" stroke="#484F58" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="9" cy="13" r="0.75" fill="#484F58"/>
              </svg>
            </div>
            <p className="text-xs text-[#484F58]">Your action plan will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
