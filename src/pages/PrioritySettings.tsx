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
import { useState } from 'react'
import { useFinanceStore, type PriorityItem } from '../store/useFinanceStore'
import { DISPLAY_CURRENCIES } from '../lib/formatters'

// ── Currency Settings section ────────────────────────────────────────────────

function CurrencySettings() {
  const settings = useFinanceStore((s) => s.settings)
  const updateSettings = useFinanceStore((s) => s.updateSettings)

  const [usdRate, setUsdRate] = useState(() => String(settings.exchangeRates.USD_ILS))
  const [eurRate, setEurRate] = useState(() => String(settings.exchangeRates.EUR_ILS))

  const handleRateBlur = (field: 'USD_ILS' | 'EUR_ILS', value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      updateSettings({ exchangeRates: { ...settings.exchangeRates, [field]: num } })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[#E6EDF3]">Display Settings</h2>
        <p className="text-sm text-[#7D8590]">Choose a currency for the dashboard summary</p>
      </div>

      {/* Display currency selector */}
      <div className="glass-card p-4 space-y-3">
        <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider block">
          Display Currency
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          {DISPLAY_CURRENCIES.map((opt) => {
            const isActive = settings.displayCurrency === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateSettings({ displayCurrency: opt.value })}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 ${
                  isActive
                    ? 'bg-[#00D4AA]/10 border-[#00D4AA]/40 text-[#00D4AA]'
                    : 'bg-transparent border-white/10 text-[#7D8590] hover:border-white/20 hover:text-[#E6EDF3]'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-[#484F58]">
          Default: ILS — dashboard amounts will be converted to the selected currency using the rates below
        </p>
      </div>

      {/* Exchange rates */}
      <div className="glass-card p-4 space-y-3">
        <label className="text-xs font-medium text-[#7D8590] uppercase tracking-wider block">
          Exchange Rates (to ILS)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-[#7D8590]">1 USD = ? ILS</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#484F58] font-mono">$→₪</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={usdRate}
                onChange={(e) => setUsdRate(e.target.value)}
                onBlur={() => handleRateBlur('USD_ILS', usdRate)}
                className="w-full bg-[#0D1117] border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-[#E6EDF3] font-mono outline-none focus:border-[#00D4AA]/50 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[#7D8590]">1 EUR = ? ILS</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#484F58] font-mono">€→₪</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={eurRate}
                onChange={(e) => setEurRate(e.target.value)}
                onBlur={() => handleRateBlur('EUR_ILS', eurRate)}
                className="w-full bg-[#0D1117] border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-[#E6EDF3] font-mono outline-none focus:border-[#00D4AA]/50 transition-colors"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-[#484F58]">Changes saved automatically on blur</p>
      </div>
    </div>
  )
}

// ── Priority list ────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<PriorityItem['type'], React.ReactNode> = {
  bank_balance: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="4" width="12" height="8" rx="1.5" stroke="#00D4AA" strokeWidth="1.2"/>
      <path d="M1 6h12" stroke="#00D4AA" strokeWidth="1.2"/>
      <circle cx="3.5" cy="9" r="0.75" fill="#00D4AA"/>
    </svg>
  ),
  bank_savings: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 11V5.5a5 5 0 0110 0V11" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="7" cy="7.5" r="0.75" fill="#F59E0B"/>
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
  bank_balance: '#00D4AA',
  bank_savings: '#F59E0B',
  bank_deposits: '#F59E0B',
  investment: '#C084FC',
}

const TYPE_LABELS: Record<PriorityItem['type'], string> = {
  bank_balance: 'Balance',
  bank_savings: 'Savings',
  bank_deposits: 'Deposits',
  investment: 'Investment',
}

function SortableItem({ item, index }: { item: PriorityItem; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${item.type}:${item.id}`,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card flex items-center gap-3 px-4 py-3 ${isDragging ? 'shadow-2xl z-50' : ''}`}
    >
      <span className="font-mono text-xs text-[#484F58] w-5 shrink-0 text-center">{index + 1}</span>

      <button
        {...attributes}
        {...listeners}
        className="text-[#484F58] hover:text-[#7D8590] cursor-grab active:cursor-grabbing p-0.5 shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="5" cy="4" r="1" fill="currentColor"/>
          <circle cx="9" cy="4" r="1" fill="currentColor"/>
          <circle cx="5" cy="7" r="1" fill="currentColor"/>
          <circle cx="9" cy="7" r="1" fill="currentColor"/>
          <circle cx="5" cy="10" r="1" fill="currentColor"/>
          <circle cx="9" cy="10" r="1" fill="currentColor"/>
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
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function PrioritySettings() {
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
    if (oldIndex === -1 || newIndex === -1) return
    reorderPriority(arrayMove(priorityConfig, oldIndex, newIndex))
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF3]">Settings</h1>
        <p className="text-sm text-[#7D8590]">Display currency and priority order</p>
      </div>

      {/* Currency settings */}
      <CurrencySettings />

      {/* Divider */}
      <div className="border-t border-white/8" />

      {/* Priority order */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#E6EDF3]">Priority Order</h2>
          <p className="text-sm text-[#7D8590]">Drag to set the order in which funds are used for suggestions</p>
        </div>

        <div className="glass-card p-4 flex items-start gap-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
            <circle cx="8" cy="8" r="7" stroke="#58A6FF" strokeWidth="1.2"/>
            <path d="M8 7v4" stroke="#58A6FF" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="8" cy="5.5" r="0.75" fill="#58A6FF"/>
          </svg>
          <p className="text-xs text-[#7D8590] leading-relaxed">
            High-priority items are used first to cover deficits. This order is respected by both the Suggestions panel and the AI Advisor.
          </p>
        </div>

        {priorityConfig.length === 0 ? (
          <p className="text-sm text-[#484F58] text-center py-8">Add accounts and investments to configure priority order.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={priorityConfig.map((p) => `${p.type}:${p.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {priorityConfig.map((item, index) => (
                  <SortableItem
                    key={`${item.type}:${item.id}`}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
