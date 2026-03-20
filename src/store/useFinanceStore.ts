import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { convertAmount } from '../lib/formatters'

export interface FinancialItem {
  id: string
  label: string
  amount: number
  currency: string
}

export interface BankAccount {
  id: string
  name: string
  balance: number
  balanceCurrency: string
  incomeItems: FinancialItem[]
  expenseItems: FinancialItem[]
  savings: number
  deposits: number
  depositsCurrency: string
  stockBalance: number
  stockCurrency: string
  color: string
  createdAt: string
}

export interface Investment {
  id: string
  name: string
  balance: number
  currency: string
  description: string
  createdAt: string
}

export interface PriorityItem {
  type: 'bank_balance' | 'bank_savings' | 'bank_deposits' | 'investment'
  id?: string
  label: string
}

export interface AppSettings {
  displayCurrency: 'ILS' | 'USD' | 'EUR'
  exchangeRates: {
    USD_ILS: number
    EUR_ILS: number
  }
}

export interface RecommendationAction {
  type: 'transfer' | 'savings_withdrawal' | 'deposit_withdrawal' | 'liquidation'
  fromId: string
  fromType: 'bank_balance' | 'bank_savings' | 'bank_deposits' | 'investment'
  toAccountId: string
  amount: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function totalIncome(account: BankAccount): number {
  return account.incomeItems.reduce((s, i) => s + i.amount, 0)
}

export function totalExpenses(account: BankAccount): number {
  return account.expenseItems.reduce((s, i) => s + i.amount, 0)
}

/** Total Balance = balance + incomes − expenses, all converted to ILS.
 *  Deposits and stocks are intentionally excluded. */
export function computeTotalBalance(
  account: BankAccount,
  rates: { USD_ILS: number; EUR_ILS: number }
): number {
  const bal = convertAmount(account.balance, account.balanceCurrency, 'ILS', rates)
  const inc = account.incomeItems.reduce(
    (s, i) => s + convertAmount(i.amount, i.currency, 'ILS', rates),
    0
  )
  const exp = account.expenseItems.reduce(
    (s, i) => s + convertAmount(i.amount, i.currency, 'ILS', rates),
    0
  )
  return bal + inc - exp
}

const ACCOUNT_COLORS = ['#00D4AA', '#58A6FF', '#F59E0B', '#C084FC', '#F87171', '#34D399']

const DEFAULT_SETTINGS: AppSettings = {
  displayCurrency: 'ILS',
  exchangeRates: { USD_ILS: 3.65, EUR_ILS: 3.95 },
}

// ── Sample data ───────────────────────────────────────────────────────────────

const SAMPLE_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-1',
    name: 'Bank Hapoalim',
    balance: 45000,
    balanceCurrency: 'ILS',
    incomeItems: [
      { id: 'i1', label: 'Salary', amount: 18000, currency: 'ILS' },
      { id: 'i2', label: 'Freelance', amount: 3500, currency: 'ILS' },
    ],
    expenseItems: [
      { id: 'e1', label: 'Rent', amount: 6500, currency: 'ILS' },
      { id: 'e2', label: 'Groceries', amount: 2200, currency: 'ILS' },
    ],
    savings: 30000,
    deposits: 50000,
    depositsCurrency: 'ILS',
    stockBalance: 15000,
    stockCurrency: 'ILS',
    color: '#00D4AA',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    name: 'Interactive Brokers',
    balance: 5200,
    balanceCurrency: 'USD',
    incomeItems: [
      { id: 'i3', label: 'Dividends', amount: 450, currency: 'USD' },
    ],
    expenseItems: [
      { id: 'e3', label: 'Platform fee', amount: 10, currency: 'USD' },
    ],
    savings: 8000,
    deposits: 0,
    depositsCurrency: 'USD',
    stockBalance: 22000,
    stockCurrency: 'USD',
    color: '#58A6FF',
    createdAt: new Date().toISOString(),
  },
]

const SAMPLE_INVESTMENTS: Investment[] = [
  {
    id: 'inv-1',
    name: 'S&P 500 ETF',
    balance: 34200,
    currency: 'USD',
    description: 'Vanguard VOO — broad market index fund tracking the S&P 500.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inv-2',
    name: 'Tech Trust Fund',
    balance: 68000,
    currency: 'ILS',
    description: 'A mutual fund focused on Israeli and international technology companies.',
    createdAt: new Date().toISOString(),
  },
]

// ── Priority builder ──────────────────────────────────────────────────────────

function buildPriorityFromData(accounts: BankAccount[], investments: Investment[]): PriorityItem[] {
  const items: PriorityItem[] = []
  for (const acc of accounts) {
    items.push({ type: 'bank_savings', id: acc.id, label: `${acc.name} — Savings` })
    items.push({ type: 'bank_deposits', id: acc.id, label: `${acc.name} — Deposits` })
    items.push({ type: 'bank_balance', id: acc.id, label: `${acc.name} — Liquid Balance` })
  }
  for (const inv of investments) {
    items.push({ type: 'investment', id: inv.id, label: inv.name })
  }
  return items
}

function buildSyncedPriority(
  current: PriorityItem[],
  accounts: BankAccount[],
  investments: Investment[]
): PriorityItem[] {
  const desired = buildPriorityFromData(accounts, investments)
  const existingKeys = new Set(current.map((p) => `${p.type}:${p.id}`))
  const desiredKeys = new Set(desired.map((p) => `${p.type}:${p.id}`))
  const kept = current.filter((p) => desiredKeys.has(`${p.type}:${p.id}`))
  const added = desired.filter((p) => !existingKeys.has(`${p.type}:${p.id}`))
  return [...kept, ...added]
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface FinanceState {
  accounts: BankAccount[]
  investments: Investment[]
  priorityConfig: PriorityItem[]
  settings: AppSettings
  sampleDataLoaded: boolean
  sampleDataDismissed: boolean

  addAccount: (data: Omit<BankAccount, 'id' | 'createdAt'>) => void
  updateAccount: (id: string, data: Partial<BankAccount>) => void
  deleteAccount: (id: string) => void

  addInvestment: (data: Omit<Investment, 'id' | 'createdAt'>) => void
  updateInvestment: (id: string, data: Partial<Investment>) => void
  deleteInvestment: (id: string) => void

  reorderPriority: (newOrder: PriorityItem[]) => void
  applyRecommendation: (action: RecommendationAction) => void
  updateSettings: (s: Partial<AppSettings>) => void
  dismissSampleBanner: () => void
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      accounts: [],
      investments: [],
      priorityConfig: [],
      settings: DEFAULT_SETTINGS,
      sampleDataLoaded: false,
      sampleDataDismissed: false,

      addAccount: (data) => {
        const account: BankAccount = { ...data, id: `acc-${Date.now()}`, createdAt: new Date().toISOString() }
        set((state) => {
          const accounts = [...state.accounts, account]
          return { accounts, priorityConfig: buildSyncedPriority(state.priorityConfig, accounts, state.investments) }
        })
      },

      updateAccount: (id, data) => {
        set((state) => ({ accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)) }))
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          priorityConfig: state.priorityConfig.filter((p) => p.id !== id),
        }))
      },

      addInvestment: (data) => {
        const investment: Investment = { ...data, id: `inv-${Date.now()}`, createdAt: new Date().toISOString() }
        set((state) => {
          const investments = [...state.investments, investment]
          return { investments, priorityConfig: buildSyncedPriority(state.priorityConfig, state.accounts, investments) }
        })
      },

      updateInvestment: (id, data) => {
        set((state) => ({ investments: state.investments.map((i) => (i.id === id ? { ...i, ...data } : i)) }))
      },

      deleteInvestment: (id) => {
        set((state) => ({
          investments: state.investments.filter((i) => i.id !== id),
          priorityConfig: state.priorityConfig.filter((p) => !(p.type === 'investment' && p.id === id)),
        }))
      },

      reorderPriority: (newOrder) => set({ priorityConfig: newOrder }),

      applyRecommendation: (action) => {
        set((state) => {
          const accounts = state.accounts.map((a) => {
            if (action.type === 'transfer') {
              if (a.id === action.fromId) return { ...a, balance: a.balance - action.amount }
              if (a.id === action.toAccountId) return { ...a, balance: a.balance + action.amount }
            } else if (action.type === 'savings_withdrawal') {
              if (a.id === action.fromId) return { ...a, savings: a.savings - action.amount, balance: a.balance + action.amount }
            } else if (action.type === 'deposit_withdrawal') {
              if (a.id === action.fromId) return { ...a, deposits: a.deposits - action.amount, balance: a.balance + action.amount }
            }
            return a
          })
          let investments = state.investments
          if (action.type === 'liquidation') {
            investments = state.investments.map((i) =>
              i.id === action.fromId ? { ...i, balance: i.balance - action.amount } : i
            )
            const idx = accounts.findIndex((a) => a.id === action.toAccountId)
            if (idx !== -1) accounts[idx] = { ...accounts[idx], balance: accounts[idx].balance + action.amount }
          }
          return { accounts, investments }
        })
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
            exchangeRates: { ...state.settings.exchangeRates, ...(newSettings.exchangeRates ?? {}) },
          },
        }))
      },

      dismissSampleBanner: () => set({ sampleDataDismissed: true }),
    }),
    {
      name: 'floww-state-v3',
      onRehydrateStorage: () => (state) => {
        if (state && state.accounts.length === 0 && state.investments.length === 0) {
          state.accounts = SAMPLE_ACCOUNTS
          state.investments = SAMPLE_INVESTMENTS
          state.priorityConfig = buildPriorityFromData(SAMPLE_ACCOUNTS, SAMPLE_INVESTMENTS)
          state.sampleDataLoaded = true
          state.sampleDataDismissed = false
        }
        if (state && !state.settings) state.settings = DEFAULT_SETTINGS
      },
    }
  )
)

export { ACCOUNT_COLORS }
