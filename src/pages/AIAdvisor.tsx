import { useState } from 'react'
import { useFinanceStore } from '../store/useFinanceStore'
import { getAIAdvice, type AIAdviceResponse, type AIAction } from '../lib/anthropic'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { formatCurrency } from '../lib/formatters'

const ACTION_ICONS: Record<AIAction['type'], React.ReactNode> = {
  transfer: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 8h12M9 4l5 4-5 4" stroke="#00D4AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  withdraw: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M4 9l4 4 4-4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  liquidate: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  deposit: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 13V3M4 7l4-4 4 4" stroke="#00D4AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  other: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="#58A6FF" strokeWidth="1.5"/>
      <path d="M8 7v4" stroke="#58A6FF" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="5.5" r="0.75" fill="#58A6FF"/>
    </svg>
  ),
}

const ACTION_COLORS: Record<AIAction['type'], string> = {
  transfer: '#00D4AA',
  withdraw: '#F59E0B',
  liquidate: '#F87171',
  deposit: '#00D4AA',
  other: '#58A6FF',
}

function ActionCard({ action }: { action: AIAction }) {
  const color = ACTION_COLORS[action.type]
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          {ACTION_ICONS[action.type]}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-[#0D1117]"
            style={{ background: color }}>
            {action.step}
          </span>
          <span className="text-xs font-medium capitalize" style={{ color }}>{action.type}</span>
        </div>
        <span className="font-mono text-sm font-semibold text-[#E6EDF3] ml-auto">
          {formatCurrency(action.amount)}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#7D8590]">
        <span className="truncate">{action.source}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="truncate text-[#E6EDF3]">{action.destination}</span>
      </div>

      {action.rationale && (
        <p className="text-xs text-[#7D8590] leading-relaxed border-t border-white/8 pt-2">{action.rationale}</p>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton width="w-7" height="h-7" className="rounded-lg" />
            <Skeleton width="w-32" height="h-4" />
            <Skeleton width="w-20" height="h-4" className="ml-auto" />
          </div>
          <Skeleton width="w-48" height="h-3" />
          <Skeleton width="w-full" height="h-3" />
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
  const [submittedNeed, setSubmittedNeed] = useState('')
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
    setSubmittedNeed(input.trim())

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
      <div className="p-6 flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 1.5L22 19.5H2L12 1.5z" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M12 9v5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="16.5" r="1" fill="#F59E0B"/>
          </svg>
        </div>
        <h2 className="text-base font-semibold text-[#E6EDF3] mb-2">API Key Required</h2>
        <p className="text-sm text-[#7D8590] max-w-sm">
          Add your Anthropic API key to a <code className="text-[#00D4AA] font-mono text-xs">.env</code> file in the project root:
        </p>
        <div className="mt-4 glass-card px-4 py-3 font-mono text-sm text-[#00D4AA]">
          VITE_ANTHROPIC_API_KEY=sk-ant-...
        </div>
        <p className="text-xs text-[#484F58] mt-3">Restart the dev server after adding the key</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF3]">AI Advisor</h1>
        <p className="text-sm text-[#7D8590]">Describe your financial goal or need</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider">
                What's your financial goal?
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. I want to buy a car for $25,000&#10;or: I need emergency funds of $5,000&#10;or: How should I rebalance my portfolio?"
                rows={5}
                className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#E6EDF3] placeholder:text-[#484F58] outline-none focus:border-[#00D4AA]/50 transition-colors resize-none leading-relaxed"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={!input.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Analyzing...
                </>
              ) : 'Get AI Advice'}
            </Button>
          </form>

          {submittedNeed && (
            <div className="glass-card p-4">
              <p className="text-xs text-[#7D8590] uppercase tracking-wider mb-2">Your goal</p>
              <p className="text-sm text-[#E6EDF3] leading-relaxed">"{submittedNeed}"</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#F87171]/8 border border-[#F87171]/20">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                <circle cx="8" cy="8" r="7" stroke="#F87171" strokeWidth="1.2"/>
                <path d="M8 5v3.5" stroke="#F87171" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="8" cy="10.5" r="0.75" fill="#F87171"/>
              </svg>
              <p className="text-sm text-[#F87171]">{error}</p>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {loading && <LoadingSkeleton />}

          {result && (
            <div className="space-y-4 animate-fade-in">
              {/* Summary */}
              <div className="glass-card p-4">
                <p className="text-xs text-[#7D8590] uppercase tracking-wider mb-2">Summary</p>
                <p className="text-sm text-[#E6EDF3] leading-relaxed">{result.summary}</p>
              </div>

              {/* Actions */}
              {result.actions?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#7D8590] uppercase tracking-wider">Action Plan</p>
                  {result.actions.map((action, i) => (
                    <ActionCard key={i} action={action} />
                  ))}
                </div>
              )}

              {/* Warnings */}
              {result.warnings?.length > 0 && (
                <div className="glass-card p-4 space-y-2">
                  <p className="text-xs font-medium text-[#F59E0B] uppercase tracking-wider">Warnings</p>
                  <ul className="space-y-1.5">
                    {result.warnings.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#7D8590]">
                        <span className="text-[#F59E0B] mt-0.5">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternatives */}
              {result.alternatives?.length > 0 && (
                <div className="glass-card p-4 space-y-2">
                  <p className="text-xs font-medium text-[#00D4AA] uppercase tracking-wider">Alternatives</p>
                  <ul className="space-y-1.5">
                    {result.alternatives.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#7D8590]">
                        <span className="text-[#00D4AA] mt-0.5">•</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#161B22] border border-white/8 flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8.5" stroke="#484F58" strokeWidth="1.5"/>
                  <path d="M7 8.5C7 6.8 8.35 5.5 10 5.5s3 1.3 3 3c0 1.8-2 3-3 3" stroke="#484F58" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="10" cy="15" r="0.75" fill="#484F58"/>
                </svg>
              </div>
              <p className="text-sm text-[#484F58]">Your action plan will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
