import { useFinanceStore } from '../../store/useFinanceStore'

export function SyncStatusBadge() {
  const syncStatus = useFinanceStore((s) => s.syncStatus)

  if (syncStatus === 'idle') return null

  const configs = {
    syncing: {
      text: 'Syncing…',
      dot: 'bg-[#9CA3AF]',
      spin: true,
    },
    synced: {
      text: 'Synced',
      dot: 'bg-[#00C896]',
      spin: false,
    },
    offline: {
      text: 'Offline',
      dot: 'bg-[#F43F5E]',
      spin: false,
    },
  } as const

  const cfg = configs[syncStatus as keyof typeof configs]
  if (!cfg) return null

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#F3F4F6] w-fit">
      {cfg.spin ? (
        <svg className="animate-spin shrink-0" width="8" height="8" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#D1D5DB" strokeWidth="3"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      )}
      <span className="text-[10px] font-medium text-[#6B7280]">{cfg.text}</span>
    </div>
  )
}
