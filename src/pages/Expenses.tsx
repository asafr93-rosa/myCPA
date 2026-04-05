import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFinanceStore } from '../store/useFinanceStore'
import type { CategoryType } from '../store/useFinanceStore'
import { ExpenseKPIs } from '../components/expenses/ExpenseKPIs'
import { CategoryBreakdownChart } from '../components/expenses/CategoryBreakdownChart'
import { TrendChart } from '../components/expenses/TrendChart'
import { CardBreakdownSection } from '../components/expenses/CardBreakdownSection'
import { TransactionTable } from '../components/expenses/TransactionTable'

export function Expenses() {
  const navigate    = useNavigate()
  const allTxns     = useFinanceStore((s) => s.transactions)
  const creditCards = useFinanceStore((s) => s.creditCards)
  const accounts    = useFinanceStore((s) => s.accounts)
  const rates       = useFinanceStore((s) => s.settings.exchangeRates)
  const displayCurrency = useFinanceStore((s) => s.settings.displayCurrency)
  const updateTransactionCategory = useFinanceStore((s) => s.updateTransactionCategory)

  // Month/year picker
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1) }
    else setMonth(month - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1) }
    else setMonth(month + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`

  const periodTxns = useMemo(() =>
    allTxns.filter((t) => t.date.startsWith(monthPrefix)),
  [allTxns, monthPrefix])

  if (creditCards.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center gap-4">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#D1D5DB]">
          <rect x="4" y="12" width="40" height="28" rx="5" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M4 20h40" stroke="currentColor" strokeWidth="2.5"/>
          <circle cx="14" cy="29" r="3" fill="currentColor"/>
        </svg>
        <div>
          <p className="text-base font-semibold text-[#374151]">No expense data yet</p>
          <p className="text-sm text-[#9CA3AF] mt-1">Add a credit card and import your first statement to see analytics here.</p>
        </div>
        <button
          onClick={() => navigate('/import')}
          className="px-5 py-2.5 rounded-xl bg-[#00C896] text-white text-sm font-semibold hover:bg-[#00B589] transition-colors"
        >
          Go to Import
        </button>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto overscroll-contain pb-24 md:pb-6">
      <div className="px-4 pt-6 max-w-3xl mx-auto flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#111827]">Expenses</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="text-sm font-semibold text-[#111827] min-w-[90px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors disabled:opacity-30"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => navigate('/import')}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1.5v6M6 7.5l-2-2M6 7.5l2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 9v1.5A1 1 0 0 0 2 11.5h8a1 1 0 0 0 1-1V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Import
            </button>
          </div>
        </div>

        {/* KPIs */}
        <ExpenseKPIs transactions={periodTxns} displayCurrency={displayCurrency} rates={rates} />

        {/* Charts */}
        <CategoryBreakdownChart transactions={periodTxns} displayCurrency={displayCurrency} rates={rates} />
        <TrendChart transactions={allTxns} creditCards={creditCards} displayCurrency={displayCurrency} rates={rates} />
        <CardBreakdownSection
          creditCards={creditCards}
          transactions={periodTxns}
          accounts={accounts}
          displayCurrency={displayCurrency}
          rates={rates}
        />

        {/* Transaction table */}
        <TransactionTable
          transactions={periodTxns}
          creditCards={creditCards}
          onCategoryChange={(id, cat: CategoryType) => updateTransactionCategory(id, cat)}
        />
      </div>
    </div>
  )
}
