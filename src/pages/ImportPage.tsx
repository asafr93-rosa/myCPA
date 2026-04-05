import { useState } from 'react'
import toast from 'react-hot-toast'
import { useFinanceStore } from '../store/useFinanceStore'
import type { CreditCard, CreditCardTransaction, CategoryType } from '../store/useFinanceStore'
import { parseCSVFile, parseWithMapping } from '../lib/csvParser'
import type { ParsedTransaction } from '../lib/csvParser'
import { categorizeTransactions } from '../lib/categorizer'
import type { CategorizeResult } from '../lib/categorizer'
import { CreditCardDrawer } from '../components/import/CreditCardDrawer'
import { UploadZone } from '../components/import/UploadZone'
import { ImportPreviewTable } from '../components/import/ImportPreviewTable'
import { ColumnMapperModal } from '../components/import/ColumnMapperModal'

type Stage = 'idle' | 'parsing' | 'mapping' | 'preview' | 'success'

export function ImportPage() {
  const creditCards           = useFinanceStore((s) => s.creditCards)
  const accounts              = useFinanceStore((s) => s.accounts)
  const categoryRules         = useFinanceStore((s) => s.categoryRules)
  const addCreditCard         = useFinanceStore((s) => s.addCreditCard)
  const updateCreditCard      = useFinanceStore((s) => s.updateCreditCard)
  const deleteCreditCard      = useFinanceStore((s) => s.deleteCreditCard)
  const addCreditCardData     = useFinanceStore((s) => s.addTransactions)
  const addImportBatch        = useFinanceStore((s) => s.addImportBatch)
  const importBatches         = useFinanceStore((s) => s.importBatches)
  const deleteImportBatch     = useFinanceStore((s) => s.deleteImportBatch)

  const [drawerOpen, setDrawerOpen]       = useState(false)
  const [editingCard, setEditingCard]     = useState<CreditCard | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Import flow state
  const [stage, setStage]                 = useState<Stage>('idle')
  const [activeCard, setActiveCard]       = useState<CreditCard | null>(null)
  const [activeFile, setActiveFile]       = useState<string>('')
  const [parsed, setParsed]               = useState<ParsedTransaction[]>([])
  const [categorized, setCategorized]     = useState<CategorizeResult[]>([])
  const [overrides, setOverrides]         = useState<Record<number, CategoryType>>({})
  // For column mapper
  const [rawHeaders, setRawHeaders]       = useState<string[]>([])
  const [rawRows, setRawRows]             = useState<string[][]>([])

  async function handleFile(card: CreditCard, file: File) {
    setActiveCard(card)
    setActiveFile(file.name)
    setOverrides({})
    setStage('parsing')

    const result = await parseCSVFile(file)

    if (result.needsMapping) {
      setRawHeaders(result.rawHeaders)
      setRawRows(result.rawRows)
      setStage('mapping')
      return
    }

    await runCategorization(card, result.transactions)
  }

  async function handleColumnMapping(colMap: Record<string, number>) {
    setStage('parsing')
    const txns = parseWithMapping(rawRows, colMap as Parameters<typeof parseWithMapping>[1])
    await runCategorization(activeCard!, txns)
  }

  async function runCategorization(card: CreditCard, txns: ParsedTransaction[]) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
    const cats   = await categorizeTransactions(txns, categoryRules, apiKey ?? null)
    setParsed(txns)
    setCategorized(cats)
    setActiveCard(card)
    setStage('preview')
  }

  function handleConfirmImport() {
    if (!activeCard || !parsed.length) return
    const batchId = crypto.randomUUID()
    const now     = new Date().toISOString()
    const total   = parsed.reduce((s, t) => s + t.amount, 0)

    addImportBatch({
      id: batchId,
      creditCardId: activeCard.id,
      fileName: activeFile,
      transactionCount: parsed.length,
      totalAmount: total,
      currency: parsed[0]?.currency ?? 'ILS',
      importedAt: now,
    })

    const txns: CreditCardTransaction[] = parsed.map((t, i) => ({
      id: crypto.randomUUID(),
      creditCardId: activeCard.id,
      date: t.date,
      businessName: t.businessName,
      amount: t.amount,
      currency: t.currency,
      category: overrides[i] ?? categorized[i]?.category ?? 'household',
      categorySource: overrides[i] ? 'user' : (categorized[i]?.source ?? 'keyword'),
      importBatchId: batchId,
      createdAt: now,
    }))

    addCreditCardData(txns)
    toast.success(`${txns.length} transactions imported`)
    setStage('success')
    setTimeout(() => setStage('idle'), 2000)
  }

  function handleCancelImport() {
    setStage('idle')
    setParsed([])
    setCategorized([])
    setOverrides({})
    setActiveCard(null)
  }

  return (
    <div className="h-full overflow-y-auto overscroll-contain pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#111827]">Import Expenses</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Upload CSV statements from your credit cards</p>
          </div>
          <button
            onClick={() => { setEditingCard(null); setDrawerOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00C896] text-white text-sm font-semibold hover:bg-[#00B589] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Card
          </button>
        </div>

        {/* Import stages */}
        {stage === 'parsing' && (
          <div className="glass-card p-8 flex flex-col items-center gap-3">
            <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="2"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#00C896" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="text-sm text-[#6B7280]">Parsing file and categorizing transactions…</p>
          </div>
        )}

        {stage === 'mapping' && (
          <ColumnMapperModal
            rawHeaders={rawHeaders}
            sampleRow={rawRows[0] ?? []}
            onConfirm={handleColumnMapping}
            onCancel={handleCancelImport}
          />
        )}

        {stage === 'preview' && (
          <div className="flex flex-col gap-4">
            <div className="glass-card px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#111827]">{activeFile}</p>
                <p className="text-xs text-[#6B7280]">{parsed.length} transactions · {activeCard?.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelImport}
                  className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-4 py-1.5 rounded-lg bg-[#00C896] text-white text-sm font-semibold hover:bg-[#00B589] transition-colors"
                >
                  Confirm Import
                </button>
              </div>
            </div>
            <ImportPreviewTable
              transactions={parsed}
              categorized={categorized}
              overrides={overrides}
              onOverride={(i, cat) => setOverrides((prev) => ({ ...prev, [i]: cat }))}
            />
          </div>
        )}

        {stage === 'success' && (
          <div className="glass-card p-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#111827]">Import complete!</p>
          </div>
        )}

        {stage === 'idle' && (
          <>
            {/* Credit card list */}
            {creditCards.length === 0 ? (
              <div className="glass-card p-8 flex flex-col items-center gap-3 text-center">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-[#D1D5DB]">
                  <rect x="3" y="9" width="30" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M3 15h30" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="10" cy="22" r="2" fill="currentColor"/>
                </svg>
                <p className="text-sm font-semibold text-[#374151]">No credit cards yet</p>
                <p className="text-xs text-[#9CA3AF]">Add a card to start importing your statements</p>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#00C896] text-white text-sm font-semibold hover:bg-[#00B589] transition-colors"
                >
                  Add Credit Card
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {creditCards.map((card) => {
                  const linkedAccount = accounts.find((a) => a.id === card.linkedBankAccountId)
                  const cardBatches   = importBatches.filter((b) => b.creditCardId === card.id)
                  return (
                    <div key={card.id} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-6 rounded-md flex items-center justify-center shrink-0"
                            style={{ backgroundColor: card.color + '20', border: `1.5px solid ${card.color}40` }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: card.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#111827]">{card.name}</p>
                            <p className="text-xs text-[#9CA3AF]">→ {linkedAccount?.name ?? 'Unknown account'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingCard(card); setDrawerOpen(true) }}
                            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          {deleteConfirm === card.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { deleteCreditCard(card.id); setDeleteConfirm(null) }}
                                className="px-2 py-1 rounded text-[10px] font-semibold bg-[#FEE2E2] text-[#DC2626]"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 rounded text-[10px] text-[#6B7280]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(card.id)}
                              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#FEE2E2]/40 transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 4h10M5 4V2.5h4V4M4.5 4l.5 7.5h4l.5-7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <UploadZone card={card} onFile={handleFile} />

                      {/* Past imports */}
                      {cardBatches.length > 0 && (
                        <div className="mt-3 flex flex-col gap-1.5">
                          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Past Imports</p>
                          {cardBatches.slice(-3).reverse().map((b) => (
                            <div key={b.id} className="flex items-center justify-between py-1.5 border-t border-[#F3F4F6] first:border-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#9CA3AF] shrink-0">
                                  <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                                  <path d="M3 5h6M3 7.5h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                                </svg>
                                <span className="text-xs text-[#374151] truncate">{b.fileName}</span>
                                <span className="text-[10px] text-[#9CA3AF] shrink-0">{b.transactionCount} txns</span>
                              </div>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete import "${b.fileName}" and its ${b.transactionCount} transactions?`)) {
                                    deleteImportBatch(b.id)
                                  }
                                }}
                                className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors ml-2 shrink-0"
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Credit card drawer */}
      <CreditCardDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingCard(null) }}
        accounts={accounts}
        initial={editingCard ?? undefined}
        onSubmit={(data) => {
          if (editingCard) updateCreditCard(editingCard.id, data)
          else addCreditCard(data)
        }}
      />
    </div>
  )
}
