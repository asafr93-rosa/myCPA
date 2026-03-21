import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRef, useState } from 'react'
import { useFinanceStore, type PriorityItem } from '../store/useFinanceStore'
import { DISPLAY_CURRENCIES } from '../lib/formatters'

// ── Profile Section ──────────────────────────────────────────────────────────

function ProfileSection() {
  const userProfile = useFinanceStore((s) => s.settings.userProfile)
  const updateSettings = useFinanceStore((s) => s.updateSettings)
  const fileRef = useRef<HTMLInputElement>(null)

  const update = (field: string, value: string) =>
    updateSettings({ userProfile: { ...userProfile, [field]: value } })

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => update('avatarDataUrl', ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[#E6EDF3]">Profile</h2>
        <p className="text-sm text-[#7D8590]">Your personal information</p>
      </div>

      <div className="glass-card p-5 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div
              className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 bg-[#1C2128] flex items-center justify-center cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              {userProfile?.avatarDataUrl ? (
                <img src={userProfile.avatarDataUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#7D8590" strokeWidth="1.5"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#7D8590" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00D4AA] flex items-center justify-center border-2 border-[#0D1117]"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M6 2.5V9.5M2.5 6H9.5" stroke="#0D1117" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#E6EDF3]">
              {userProfile?.name || 'Your Name'}
            </p>
            <p className="text-xs text-[#7D8590]">Tap photo to change</p>
          </div>
        </div>

        {/* Name + Age */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider block">Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={userProfile?.name ?? ''}
              onChange={(e) => update('name', e.target.value)}
              className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E6EDF3] placeholder:text-[#484F58] outline-none focus:border-[#00D4AA]/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider block">Age</label>
            <input
              type="number"
              placeholder="—"
              min="1"
              max="120"
              value={userProfile?.age ?? ''}
              onChange={(e) => update('age', e.target.value)}
              className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#E6EDF3] placeholder:text-[#484F58] outline-none focus:border-[#00D4AA]/50 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Appearance Section ───────────────────────────────────────────────────────

function AppearanceSection() {
  const theme = useFinanceStore((s) => s.settings.theme)
  const updateSettings = useFinanceStore((s) => s.updateSettings)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[#E6EDF3]">Appearance</h2>
        <p className="text-sm text-[#7D8590]">Choose your preferred theme</p>
      </div>

      <div className="glass-card p-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Dark */}
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              theme === 'dark' ? 'border-[#00D4AA]' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="bg-[#0D1117] p-3 space-y-1.5">
              <div className="h-2 w-12 rounded bg-[#E6EDF3]/20 mb-2" />
              <div className="h-8 rounded-lg bg-[#161B22] border border-white/8" />
              <div className="h-8 rounded-lg bg-[#161B22] border border-white/8" />
            </div>
            <div className={`flex items-center justify-between px-3 py-2 bg-[#161B22] border-t border-white/8 ${
              theme === 'dark' ? 'text-[#00D4AA]' : 'text-[#7D8590]'
            }`}>
              <span className="text-xs font-medium">Dark</span>
              {theme === 'dark' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#00D4AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>

          {/* Light */}
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              theme === 'light' ? 'border-[#00D4AA]' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="bg-[#F0F2F5] p-3 space-y-1.5">
              <div className="h-2 w-12 rounded bg-black/15 mb-2" />
              <div className="h-8 rounded-lg bg-white border border-black/8" />
              <div className="h-8 rounded-lg bg-white border border-black/8" />
            </div>
            <div className={`flex items-center justify-between px-3 py-2 bg-white border-t border-black/8 ${
              theme === 'light' ? 'text-[#00D4AA]' : 'text-[#7D8590]'
            }`}>
              <span className="text-xs font-medium" style={{ color: theme === 'light' ? '#00D4AA' : '#6B7280' }}>Light</span>
              {theme === 'light' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#00D4AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Currency Section ─────────────────────────────────────────────────────────

function CurrencySection() {
  const settings = useFinanceStore((s) => s.settings)
  const updateSettings = useFinanceStore((s) => s.updateSettings)

  const [usdRate, setUsdRate] = useState(() => String(settings.exchangeRates.USD_ILS))
  const [eurRate, setEurRate] = useState(() => String(settings.exchangeRates.EUR_ILS))
  const [gbpRate, setGbpRate] = useState(() => String(settings.exchangeRates.GBP_ILS ?? 4.60))

  const handleRateBlur = (field: 'USD_ILS' | 'EUR_ILS' | 'GBP_ILS', value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      updateSettings({ exchangeRates: { ...settings.exchangeRates, [field]: num } })
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[#E6EDF3]">Currency</h2>
        <p className="text-sm text-[#7D8590]">Dashboard display currency and exchange rates</p>
      </div>

      <div className="glass-card p-4 space-y-4">
        {/* Display currency buttons */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider block">Display Currency</label>
          <div className="grid grid-cols-4 gap-2">
            {DISPLAY_CURRENCIES.map((opt) => {
              const isActive = settings.displayCurrency === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ displayCurrency: opt.value })}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 flex flex-col items-center gap-0.5 ${
                    isActive
                      ? 'bg-[#00D4AA]/10 border-[#00D4AA]/40 text-[#00D4AA]'
                      : 'bg-transparent border-white/10 text-[#7D8590] hover:border-white/20 hover:text-[#E6EDF3]'
                  }`}
                >
                  <span className="font-mono text-base leading-none">{opt.symbol}</span>
                  <span className="text-[10px] tracking-wider">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Exchange rate inputs */}
        <div className="space-y-2 pt-1 border-t border-white/8">
          <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider block pt-1">
            Rates vs ILS
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'USD', prefix: '$→₪', field: 'USD_ILS' as const, value: usdRate, set: setUsdRate },
              { label: 'EUR', prefix: '€→₪', field: 'EUR_ILS' as const, value: eurRate, set: setEurRate },
              { label: 'GBP', prefix: '£→₪', field: 'GBP_ILS' as const, value: gbpRate, set: setGbpRate },
            ].map((r) => (
              <div key={r.field} className="space-y-1">
                <p className="text-[10px] text-[#484F58] font-mono">{r.prefix}</p>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={r.value}
                  onChange={(e) => r.set(e.target.value)}
                  onBlur={() => handleRateBlur(r.field, r.value)}
                  className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-2 py-2 text-sm text-[#E6EDF3] font-mono outline-none focus:border-[#00D4AA]/50 transition-colors text-center"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-[#484F58]">Auto-saved on blur</p>
        </div>
      </div>
    </div>
  )
}

// ── Priority Section ─────────────────────────────────────────────────────────

const TYPE_ICONS: Record<PriorityItem['type'], React.ReactNode> = {
  bank_balance: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="4" width="12" height="8" rx="1.5" stroke="#00D4AA" strokeWidth="1.2"/>
      <path d="M1 6h12" stroke="#00D4AA" strokeWidth="1.2"/>
      <circle cx="3.5" cy="9" r="0.75" fill="#00D4AA"/>
    </svg>
  ),
  bank_deposits: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="#F59E0B" strokeWidth="1.2"/>
      <path d="M4 7h6M7 5v4" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  investment: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 11l3-3 2 2 3-4 2 2" stroke="#C084FC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}
const TYPE_COLORS: Record<PriorityItem['type'], string> = {
  bank_balance: '#00D4AA', bank_deposits: '#F59E0B', investment: '#C084FC',
}
const TYPE_LABELS: Record<PriorityItem['type'], string> = {
  bank_balance: 'Balance', bank_deposits: 'Deposits', investment: 'Investment',
}

function SortableItem({
  item, index, isFirst, isLast, onMoveUp, onMoveDown,
}: {
  item: PriorityItem; index: number; isFirst: boolean; isLast: boolean
  onMoveUp: () => void; onMoveDown: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${item.type}:${item.id}`,
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={`glass-card flex items-center gap-3 px-4 py-3 min-h-[52px] ${isDragging ? 'shadow-2xl z-50' : ''}`}
    >
      <span className="font-mono text-xs text-[#484F58] w-5 shrink-0 text-center">{index + 1}</span>
      <button {...attributes} {...listeners} className="text-[#484F58] hover:text-[#7D8590] cursor-grab active:cursor-grabbing p-0.5 shrink-0 hidden sm:flex">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="5" cy="4" r="1" fill="currentColor"/><circle cx="9" cy="4" r="1" fill="currentColor"/>
          <circle cx="5" cy="7" r="1" fill="currentColor"/><circle cx="9" cy="7" r="1" fill="currentColor"/>
          <circle cx="5" cy="10" r="1" fill="currentColor"/><circle cx="9" cy="10" r="1" fill="currentColor"/>
        </svg>
      </button>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${TYPE_COLORS[item.type]}15`, border: `1px solid ${TYPE_COLORS[item.type]}30` }}>
        {TYPE_ICONS[item.type]}
      </div>
      <span className="text-sm text-[#E6EDF3] flex-1 truncate">{item.label}</span>
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
        style={{ color: TYPE_COLORS[item.type], background: `${TYPE_COLORS[item.type]}15` }}>
        {TYPE_LABELS[item.type]}
      </span>
      {/* Arrow buttons — primary mobile reorder control */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#7D8590] hover:text-[#E6EDF3] hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 9V3M3 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#7D8590] hover:text-[#E6EDF3] hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 3v6M3 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function PrioritySection() {
  const priorityConfig = useFinanceStore((s) => s.priorityConfig)
  const reorderPriority = useFinanceStore((s) => s.reorderPriority)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = priorityConfig.map((p) => `${p.type}:${p.id}`)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex !== -1 && newIndex !== -1) reorderPriority(arrayMove(priorityConfig, oldIndex, newIndex))
  }

  const moveItem = (from: number, to: number) => {
    const next = [...priorityConfig]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    reorderPriority(next)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[#E6EDF3]">Priority Order</h2>
        <p className="text-sm text-[#7D8590]">Use arrows (or drag on desktop) to set how funds are used for suggestions</p>
      </div>

      <div className="glass-card p-4 flex items-start gap-3 mb-1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
          <circle cx="8" cy="8" r="7" stroke="#58A6FF" strokeWidth="1.2"/>
          <path d="M8 7v4" stroke="#58A6FF" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="8" cy="5.5" r="0.75" fill="#58A6FF"/>
        </svg>
        <p className="text-xs text-[#7D8590] leading-relaxed">
          High-priority items are used first to cover deficits. This order applies to both the Suggestions panel and the AI Advisor.
        </p>
      </div>

      {priorityConfig.length === 0 ? (
        <p className="text-sm text-[#484F58] text-center py-6">Add accounts and investments to configure priority order.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={priorityConfig.map((p) => `${p.type}:${p.id}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {priorityConfig.map((item, index) => (
                <SortableItem
                  key={`${item.type}:${item.id}`}
                  item={item}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === priorityConfig.length - 1}
                  onMoveUp={() => moveItem(index, index - 1)}
                  onMoveDown={() => moveItem(index, index + 1)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function PrioritySettings() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Fixed header */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-white/8">
        <h1 className="text-xl font-semibold text-[#E6EDF3]">My Profile</h1>
        <p className="text-sm text-[#7D8590]">Personal info, appearance, currency, and priorities</p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-6 pb-24 md:pb-6 space-y-8">
        <ProfileSection />
        <div className="border-t border-white/8" />
        <AppearanceSection />
        <div className="border-t border-white/8" />
        <CurrencySection />
        <div className="border-t border-white/8" />
        <PrioritySection />
      </div>
    </div>
  )
}
