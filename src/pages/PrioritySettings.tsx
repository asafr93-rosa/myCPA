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
    <div className="space-y-3">
      <div className="glass-card p-4 space-y-3">
        <p className="text-[10px] font-semibold text-[#484F58] uppercase tracking-widest">Display Currency</p>
        <div className="flex gap-2">
          {DISPLAY_CURRENCIES.map((opt) => {
            const isActive = settings.displayCurrency === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateSettings({ displayCurrency: opt.value })}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-150 ${
                  isActive
                    ? 'bg-[#00D4AA]/10 border-[#00D4AA]/40 text-[#00D4AA]'
                    : 'bg-transparent border-white/10 text-[#484F58] hover:border-white/20 hover:text-[#7D8590]'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="glass-card p-4 space-y-3">
        <p className="text-[10px] font-semibold text-[#484F58] uppercase tracking-widest">Exchange Rates to ILS</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-[#484F58]">1 USD =</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#484F58] font-mono">₪</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={usdRate}
                onChange={(e) => setUsdRate(e.target.value)}
                onBlur={() => handleRateBlur('USD_ILS', usdRate)}
                className="w-full bg-[#0D1117] border border-white/10 rounded-lg pl-6 pr-3 py-2 text-sm text-[#E6EDF3] font-mono outline-none focus:border-[#00D4AA]/50 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[#484F58]">1 EUR =</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#484F58] font-mono">₪</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={eurRate}
                onChange={(e) => setEurRate(e.target.value)}
                onBlur={() => handleRateBlur('EUR_ILS', eurRate)}
                className="w-full bg-[#0D1117] border border-white/10 rounded-lg pl-6 pr-3 py-2 text-sm text-[#E6EDF3] font-mono outline-none focus:border-[#00D4AA]/50 transition-colors"
              />
            </div>
          </div>
        </div>
        <p className="text-[10px] text-[#484F58]">Saved automatically on blur</p>
      </div>
    </div>
  )
}

const TYPE_COLORS: Record<PriorityItem['type'], string> = {
  bank_balance: '#00D4AA',
  bank_savings: '#F59E0B',
  bank_deposits: '#C084FC',
  investment: '#58A6FF',
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
    opacity: isDragging ? 0.4 : 1,
  }

  const color = TYPE_COLORS[item.type]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card flex items-center gap-3 px-4 py-2.5 ${isDragging ? 'shadow-2xl' : ''}`}
    >
      <span className="font-mono text-[10px] text-[#484F58] w-4 shrink-0 text-center">{index + 1}</span>
      <button
        {...attributes}
        {...listeners}
        className="text-[#484F58] hover:text-[#7D8590] cursor-grab active:cursor-grabbing shrink-0"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="4" cy="3" r="1" fill="currentColor"/>
          <circle cx="8" cy="3" r="1" fill="currentColor"/>
          <circle cx="4" cy="6" r="1" fill="currentColor"/>
          <circle cx="8" cy="6" r="1" fill="currentColor"/>
          <circle cx="4" cy="9" r="1" fill="currentColor"/>
          <circle cx="8" cy="9" r="1" fill="currentColor"/>
        </svg>
      </button>
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span className="text-sm text-[#E6EDF3] flex-1 truncate">{item.label}</span>
      <span
        className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
        style={{ color, background: `${color}15` }}
      >
        {TYPE_LABELS[item.type]}
      </span>
    </div>
  )
}

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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-4">
        <h1 className="text-base font-semibold text-[#E6EDF3]">Settings</h1>
        <p className="text-xs text-[#484F58]">Currency and suggestion priority</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-24 md:pb-6 space-y-5">
        <CurrencySettings />

        <div className="border-t border-white/5" />

        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-[#E6EDF3] mb-0.5">Priority Order</p>
            <p className="text-xs text-[#484F58]">Drag to set which funds are used first for suggestions</p>
          </div>

          {priorityConfig.length === 0 ? (
            <p className="text-xs text-[#484F58] py-6 text-center">
              Add accounts or investments to configure priority order.
            </p>
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
    </div>
  )
}
