import { useState, useMemo } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { autoFormatInput, parseFormattedNumber, formatCurrency, convertAmount } from '../../lib/formatters'
import { ACCOUNT_COLORS } from '../../store/useFinanceStore'
import type { BankAccount, FinancialItem } from '../../store/useFinanceStore'
import { useFinanceStore } from '../../store/useFinanceStore'

const FIELD_CURRENCIES = ['ILS', 'USD', 'EUR', 'GBP']

// ── Currency selector ─────────────────────────────────────────────────────────

function CurrencySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#0D1117] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-[#7D8590] outline-none focus:border-[#00D4AA]/50 transition-colors shrink-0 w-16"
    >
      {FIELD_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  )
}

// ── Financial item row ────────────────────────────────────────────────────────

interface ItemRowProps {
  item: FinancialItem
  isFirst: boolean
  onUpdate: (id: string, label: string, amount: number, currency: string) => void
  onRemove: (id: string) => void
}

function ItemRow({ item, isFirst, onUpdate, onRemove }: ItemRowProps) {
  const [amountStr, setAmountStr] = useState(() =>
    item.amount > 0 ? autoFormatInput(String(item.amount)) : ''
  )

  return (
    <div className="flex items-center gap-1.5">
      <input
        placeholder="Description"
        value={item.label}
        onChange={(e) => onUpdate(item.id, e.target.value, item.amount, item.currency)}
        className="flex-1 min-w-0 bg-[#0D1117] border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-[#E6EDF3] placeholder:text-[#484F58] outline-none focus:border-white/20 transition-colors"
      />
      <input
        placeholder="0.00"
        value={amountStr}
        onChange={(e) => {
          const formatted = autoFormatInput(e.target.value)
          setAmountStr(formatted)
          onUpdate(item.id, item.label, parseFormattedNumber(formatted), item.currency)
        }}
        className="w-24 bg-[#0D1117] border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-[#E6EDF3] font-mono placeholder:text-[#484F58] outline-none focus:border-white/20 transition-colors text-right"
      />
      <CurrencySelect value={item.currency} onChange={(c) => onUpdate(item.id, item.label, item.amount, c)} />
      {!isFirst && (
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="w-6 h-6 flex items-center justify-center rounded text-[#484F58] hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors shrink-0"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M8 2L2 8M2 2l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
      {isFirst && <div className="w-6 shrink-0" />}
    </div>
  )
}

// ── Section with item list ────────────────────────────────────────────────────

interface ItemsSectionProps {
  title: string
  items: FinancialItem[]
  addLabel: string
  onChange: (items: FinancialItem[]) => void
}

function ItemsSection({ title, items, addLabel, onChange }: ItemsSectionProps) {
  const update = (id: string, label: string, amount: number, currency: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, label, amount, currency } : i)))
  }
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id))
  const add = () =>
    onChange([...items, { id: `item-${Date.now()}-${Math.random()}`, label: '', amount: 0, currency: 'ILS' }])

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[#7D8590] uppercase tracking-wider">{title}</p>
      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <ItemRow key={item.id} item={item} isFirst={idx === 0} onUpdate={update} onRemove={remove} />
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-[#484F58] hover:text-[#E6EDF3] py-1 px-2 rounded border border-dashed border-white/10 hover:border-white/20 transition-colors"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {addLabel}
      </button>
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

interface AccountFormProps {
  initial?: Partial<BankAccount>
  onSubmit: (data: Omit<BankAccount, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

export function AccountForm({ initial, onSubmit, onCancel }: AccountFormProps) {
  const rates = useFinanceStore((s) => s.settings.exchangeRates)

  const [name, setName] = useState(initial?.name ?? '')
  const [balance, setBalance] = useState(
    initial?.balance !== undefined ? autoFormatInput(String(initial.balance)) : ''
  )
  const [balanceCurrency, setBalanceCurrency] = useState(initial?.balanceCurrency ?? 'ILS')

  const [incomeItems, setIncomeItems] = useState<FinancialItem[]>(
    initial?.incomeItems?.length
      ? initial.incomeItems
      : [{ id: 'salary-default', label: 'Salary', amount: 0, currency: 'ILS' }]
  )
  const [expenseItems, setExpenseItems] = useState<FinancialItem[]>(
    initial?.expenseItems?.length
      ? initial.expenseItems
      : [{ id: 'expense-default', label: '', amount: 0, currency: 'ILS' }]
  )

  const [deposits, setDeposits] = useState(
    initial?.deposits !== undefined ? autoFormatInput(String(initial.deposits)) : ''
  )
  const [depositsCurrency, setDepositsCurrency] = useState(initial?.depositsCurrency ?? 'ILS')

  const [stockBalance, setStockBalance] = useState(
    initial?.stockBalance !== undefined ? autoFormatInput(String(initial.stockBalance)) : ''
  )
  const [stockCurrency, setStockCurrency] = useState(initial?.stockCurrency ?? 'ILS')

  const [color, setColor] = useState(initial?.color ?? ACCOUNT_COLORS[0])
  const [errors, setErrors] = useState<{ name?: string; balance?: string }>({})

  // Live total preview (ILS)
  const liveTotal = useMemo(() => {
    const bal = convertAmount(parseFormattedNumber(balance), balanceCurrency, 'ILS', rates)
    const inc = incomeItems.reduce((s, i) => s + convertAmount(i.amount, i.currency, 'ILS', rates), 0)
    const exp = expenseItems.reduce((s, i) => s + convertAmount(i.amount, i.currency, 'ILS', rates), 0)
    return bal + inc - exp
  }, [balance, balanceCurrency, incomeItems, expenseItems, rates])

  const validate = () => {
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = 'Account name required'
    if (!balance) errs.balance = 'Balance required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      name: name.trim(),
      balance: parseFormattedNumber(balance),
      balanceCurrency,
      incomeItems,
      expenseItems,
      savings: initial?.savings ?? 0,
      deposits: parseFormattedNumber(deposits),
      depositsCurrency,
      stockBalance: parseFormattedNumber(stockBalance),
      stockCurrency,
      color,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Account name */}
      <Input
        label="Account Name"
        placeholder="e.g. Bank Hapoalim"
        value={name}
        onChange={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })) }}
        error={errors.name}
      />

      {/* Current Balance */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-[#7D8590] uppercase tracking-wider">Current Balance</p>
        <div className="flex items-center gap-1.5">
          <input
            placeholder="0.00"
            value={balance}
            onChange={(e) => {
              const v = autoFormatInput(e.target.value)
              setBalance(v)
              setErrors((err) => ({ ...err, balance: undefined }))
            }}
            className={`flex-1 bg-[#0D1117] border rounded-lg px-3 py-2 text-sm text-[#E6EDF3] font-mono placeholder:text-[#484F58] outline-none transition-colors ${
              errors.balance ? 'border-[#F87171]/50' : 'border-white/10 focus:border-[#00D4AA]/50'
            }`}
          />
          <CurrencySelect value={balanceCurrency} onChange={setBalanceCurrency} />
        </div>
        {errors.balance && <p className="text-xs text-[#F87171]">{errors.balance}</p>}
      </div>

      <div className="border-t border-white/8" />

      {/* Income section */}
      <ItemsSection
        title="Income"
        items={incomeItems}
        addLabel="Add Income"
        onChange={setIncomeItems}
      />

      <div className="border-t border-white/8" />

      {/* Expenses section */}
      <ItemsSection
        title="Expenses"
        items={expenseItems}
        addLabel="Add Expense"
        onChange={setExpenseItems}
      />

      <div className="border-t border-white/8" />

      {/* Deposits */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-[#7D8590] uppercase tracking-wider">Deposits</p>
        <div className="flex items-center gap-1.5">
          <input
            placeholder="0.00"
            value={deposits}
            onChange={(e) => setDeposits(autoFormatInput(e.target.value))}
            className="flex-1 bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E6EDF3] font-mono placeholder:text-[#484F58] outline-none focus:border-[#00D4AA]/50 transition-colors"
          />
          <CurrencySelect value={depositsCurrency} onChange={setDepositsCurrency} />
        </div>
      </div>

      {/* Stock Exchange */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-[#7D8590] uppercase tracking-wider">Stocks</p>
        <div className="flex items-center gap-1.5">
          <input
            placeholder="0.00"
            value={stockBalance}
            onChange={(e) => setStockBalance(autoFormatInput(e.target.value))}
            className="flex-1 bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#E6EDF3] font-mono placeholder:text-[#484F58] outline-none focus:border-[#00D4AA]/50 transition-colors"
          />
          <CurrencySelect value={stockCurrency} onChange={setStockCurrency} />
        </div>
      </div>

      <div className="border-t border-white/8" />

      {/* Color picker */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#7D8590] uppercase tracking-wider">Account Color</p>
        <div className="flex gap-2">
          {ACCOUNT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-[#161B22] scale-110' : 'opacity-50 hover:opacity-90'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      {/* Live total preview */}
      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#0D1117] border border-white/8">
        <span className="text-xs text-[#7D8590]">Total Balance (preview)</span>
        <span className={`font-mono text-base font-semibold ${liveTotal < 0 ? 'text-[#F87171]' : 'text-[#00D4AA]'}`}>
          {formatCurrency(liveTotal, 'ILS')}
        </span>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" variant="primary" className="flex-1">
          {initial?.name ? 'Save Changes' : 'Add Account'}
        </Button>
      </div>
    </form>
  )
}
