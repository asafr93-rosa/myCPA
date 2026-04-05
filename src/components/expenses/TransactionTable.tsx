import { useState, useMemo } from 'react'
import type { CreditCardTransaction, CreditCard, CategoryType } from '../../store/useFinanceStore'
import { formatCurrency } from '../../lib/formatters'
import { CategorySelect } from './CategorySelect'

interface Props {
  transactions: CreditCardTransaction[]
  creditCards: CreditCard[]
  onCategoryChange: (id: string, cat: CategoryType) => void
}

type SortKey = 'date' | 'amount' | 'businessName'

const PAGE_SIZE = 50

export function TransactionTable({ transactions, creditCards, onCategoryChange }: Props) {
  const [search, setSearch]       = useState('')
  const [filterCard, setFilterCard] = useState<string>('all')
  const [filterCat, setFilterCat]   = useState<CategoryType | 'all'>('all')
  const [sortKey, setSortKey]       = useState<SortKey>('date')
  const [sortAsc, setSortAsc]       = useState(false)
  const [page, setPage]             = useState(0)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
    setPage(0)
  }

  const cardMap = useMemo(() =>
    Object.fromEntries(creditCards.map((c) => [c.id, c])),
  [creditCards])

  const filtered = useMemo(() => {
    let list = transactions
    if (search)             list = list.filter((t) => t.businessName.toLowerCase().includes(search.toLowerCase()))
    if (filterCard !== 'all') list = list.filter((t) => t.creditCardId === filterCard)
    if (filterCat  !== 'all') list = list.filter((t) => t.category === filterCat)

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'date')         cmp = a.date.localeCompare(b.date)
      else if (sortKey === 'amount')  cmp = a.amount - b.amount
      else                            cmp = a.businessName.localeCompare(b.businessName)
      return sortAsc ? cmp : -cmp
    })
    return list
  }, [transactions, search, filterCard, filterCat, sortKey, sortAsc])

  const paged     = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span className="ml-1 text-[#D1D5DB]">↕</span>
    return <span className="ml-1 text-[#00C896]">{sortAsc ? '↑' : '↓'}</span>
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Filters */}
      <div className="px-4 py-3 border-b border-[#F3F4F6] flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          placeholder="Search business…"
          className="flex-1 min-w-[140px] text-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 text-[#374151] placeholder:text-[#9CA3AF]"
        />
        <select
          value={filterCard}
          onChange={(e) => { setFilterCard(e.target.value); setPage(0) }}
          className="text-xs px-2 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#374151] focus:outline-none"
        >
          <option value="all">All cards</option>
          {creditCards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={filterCat}
          onChange={(e) => { setFilterCat(e.target.value as CategoryType | 'all'); setPage(0) }}
          className="text-xs px-2 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#374151] focus:outline-none"
        >
          <option value="all">All categories</option>
          {(['food','bills','insurance','transport','fuel','haircut','household'] as CategoryType[]).map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <span className="text-xs text-[#9CA3AF] ml-auto">{filtered.length} transactions</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3F4F6] text-[#9CA3AF]">
              <th
                onClick={() => toggleSort('date')}
                className="px-4 py-2.5 text-left font-semibold cursor-pointer select-none whitespace-nowrap"
              >
                Date <SortIcon k="date" />
              </th>
              <th
                onClick={() => toggleSort('businessName')}
                className="px-4 py-2.5 text-left font-semibold cursor-pointer select-none"
              >
                Business <SortIcon k="businessName" />
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">Card</th>
              <th className="px-4 py-2.5 text-left font-semibold">Category</th>
              <th
                onClick={() => toggleSort('amount')}
                className="px-4 py-2.5 text-right font-semibold cursor-pointer select-none whitespace-nowrap"
              >
                Amount <SortIcon k="amount" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#9CA3AF]">No transactions found</td>
              </tr>
            ) : paged.map((t) => (
              <tr key={t.id} className="border-b border-[#F9FAFB] hover:bg-[#F9FAFB] transition-colors">
                <td className="px-4 py-2.5 text-[#6B7280] whitespace-nowrap font-mono">{t.date}</td>
                <td className="px-4 py-2.5 text-[#111827] font-medium max-w-[180px] truncate">{t.businessName}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cardMap[t.creditCardId]?.color ?? '#9CA3AF' }}
                    />
                    <span className="text-[#6B7280] truncate max-w-[80px]">
                      {cardMap[t.creditCardId]?.name ?? '—'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <CategorySelect
                    value={t.category}
                    onChange={(cat) => onCategoryChange(t.id, cat)}
                  />
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#111827] whitespace-nowrap">
                  {formatCurrency(t.amount, t.currency as 'ILS')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[#F3F4F6] flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[#374151] disabled:opacity-40 hover:bg-[#F9FAFB] transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-[#6B7280]">Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[#374151] disabled:opacity-40 hover:bg-[#F9FAFB] transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
