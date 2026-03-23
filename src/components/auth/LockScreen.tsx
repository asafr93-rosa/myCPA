import { useState } from 'react'
import {
  hasCredential,
  isBiometricSupported,
  registerBiometric,
  authenticateBiometric,
} from '../../lib/webauthn'

interface Props {
  onUnlock: () => void
}

export function LockScreen({ onUnlock }: Props) {
  const supported = isBiometricSupported()
  const registered = hasCredential()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBiometric() {
    setError(null)
    setLoading(true)
    try {
      if (registered) {
        await authenticateBiometric()
      } else {
        await registerBiometric()
      }
      onUnlock()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('abort')) {
        setError('Face ID was cancelled — try again')
      } else if (msg.toLowerCase().includes('not allowed') || msg.toLowerCase().includes('permission')) {
        setError('Biometric access denied — check Safari settings')
      } else {
        setError('Face ID failed — try again')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F8F9FA] z-50 px-8">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-16">
        <div className="w-9 h-9 rounded-xl bg-[#00C896] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 14 L8 9 L11 12 L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-[#111827]">Floww</span>
      </div>

      {/* Greeting */}
      <p className="text-2xl font-semibold text-[#111827] mb-2">Welcome back</p>
      <p className="text-sm text-[#6B7280] mb-12">
        {registered ? 'Use Face ID to unlock' : 'Set up Face ID to secure your data'}
      </p>

      {/* Face ID button */}
      {supported && (
        <button
          onClick={handleBiometric}
          disabled={loading}
          className="flex flex-col items-center gap-3 group disabled:opacity-50"
        >
          <div className="w-20 h-20 rounded-2xl border-2 border-[#00C896]/40 bg-[#00C896]/08 flex items-center justify-center group-active:scale-95 transition-transform">
            {loading ? (
              <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#00C896" strokeWidth="2" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#00C896" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                {/* Face ID icon */}
                <rect x="2" y="2" width="10" height="10" rx="3" stroke="#00C896" strokeWidth="2"/>
                <rect x="24" y="2" width="10" height="10" rx="3" stroke="#00C896" strokeWidth="2"/>
                <rect x="2" y="24" width="10" height="10" rx="3" stroke="#00C896" strokeWidth="2"/>
                <rect x="24" y="24" width="10" height="10" rx="3" stroke="#00C896" strokeWidth="2"/>
                <circle cx="13" cy="14" r="1.5" fill="#00C896"/>
                <circle cx="23" cy="14" r="1.5" fill="#00C896"/>
                <path d="M13 22 Q18 26 23 22" stroke="#00C896" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm font-medium text-[#00C896]">
            {loading ? 'Authenticating…' : registered ? 'Use Face ID' : 'Set up Face ID'}
          </span>
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="mt-6 text-sm text-[#F43F5E] text-center max-w-xs">{error}</p>
      )}

      {/* Skip */}
      <button
        onClick={onUnlock}
        className="mt-10 text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
      >
        {supported ? 'Skip for now' : 'Continue without Face ID'}
      </button>
    </div>
  )
}
