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

export type AssetCategory = 'real_estate' | 'vehicle' | 'other'

export interface Asset {
  id: string
  name: string
  value: number
  currency: string
  category: AssetCategory
  description: string
  createdAt: string
}

export interface InvestmentSnapshot {
  id: string
  investmentId: string
  value: number
  currency: string
  valueILS: number      // pre-converted at snapshot time
  note: string
  recordedAt: string    // ISO — can be backdated
}

export type TrackingFrequency = 'monthly' | 'quarterly' | 'custom'

export interface InvestmentTracking {
  investmentId: string
  frequency: TrackingFrequency
  lastLoggedAt: string | null
}

export interface PriorityItem {
  type: 'bank_balance' | 'bank_savings' | 'bank_deposits' | 'investment'
  id?: string
  label: string
}

export interface UserProfile {
  name: string
  age: string
  avatarDataUrl: string
}

export interface AppSettings {
  displayCurrency: 'ILS' | 'USD' | 'EUR' | 'GBP'
  exchangeRates: {
    USD_ILS: number
    EUR_ILS: number
    GBP_ILS: number
  }
  theme: 'dark' | 'light'
  userProfile: UserProfile
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
  exchangeRates: { USD_ILS: 3.65, EUR_ILS: 3.95, GBP_ILS: 4.60 },
  theme: 'dark',
  userProfile: { name: '', age: '', avatarDataUrl: '' },
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

// Sample snapshots for demo — multiple months of history
const _d = (monthsAgo: number) => {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo)
  return d.toISOString()
}
const DEFAULT_RATES = DEFAULT_SETTINGS.exchangeRates

const SAMPLE_SNAPSHOTS: InvestmentSnapshot[] = [
  // S&P 500 ETF (USD) — 5 snapshots over 5 months
  { id: 'snap-s1', investmentId: 'inv-1', value: 28000, currency: 'USD', valueILS: 28000 * DEFAULT_RATES.USD_ILS, note: 'Initial', recordedAt: _d(4) },
  { id: 'snap-s2', investmentId: 'inv-1', value: 30500, currency: 'USD', valueILS: 30500 * DEFAULT_RATES.USD_ILS, note: '', recordedAt: _d(3) },
  { id: 'snap-s3', investmentId: 'inv-1', value: 31800, currency: 'USD', valueILS: 31800 * DEFAULT_RATES.USD_ILS, note: '', recordedAt: _d(2) },
  { id: 'snap-s4', investmentId: 'inv-1', value: 33100, currency: 'USD', valueILS: 33100 * DEFAULT_RATES.USD_ILS, note: '', recordedAt: _d(1) },
  { id: 'snap-s5', investmentId: 'inv-1', value: 34200, currency: 'USD', valueILS: 34200 * DEFAULT_RATES.USD_ILS, note: '', recordedAt: _d(0) },
  // Tech Trust Fund (ILS) — 5 snapshots
  { id: 'snap-t1', investmentId: 'inv-2', value: 60000, currency: 'ILS', valueILS: 60000, note: 'Initial', recordedAt: _d(4) },
  { id: 'snap-t2', investmentId: 'inv-2', value: 62500, currency: 'ILS', valueILS: 62500, note: '', recordedAt: _d(3) },
  { id: 'snap-t3', investmentId: 'inv-2', value: 63800, currency: 'ILS', valueILS: 63800, note: '', recordedAt: _d(2) },
  { id: 'snap-t4', investmentId: 'inv-2', value: 65500, currency: 'ILS', valueILS: 65500, note: '', recordedAt: _d(1) },
  { id: 'snap-t5', investmentId: 'inv-2', value: 68000, currency: 'ILS', valueILS: 68000, note: '', recordedAt: _d(0) },
]

// ── Sample assets ─────────────────────────────────────────────────────────────

const SAMPLE_ASSETS: Asset[] = [
  {
    id: 'asset-1',
    name: 'Apartment — Tel Aviv',
    value: 2000000,
    currency: 'ILS',
    category: 'real_estate',
    description: '3-bedroom apartment in central Tel Aviv.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'asset-2',
    name: 'Toyota Corolla',
    value: 25000,
    currency: 'USD',
    category: 'vehicle',
    description: '2021 Toyota Corolla.',
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
  assets: Asset[]
  snapshots: InvestmentSnapshot[]
  trackingSettings: InvestmentTracking[]
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

  addAsset: (data: Omit<Asset, 'id' | 'createdAt'>) => void
  updateAsset: (id: string, data: Partial<Asset>) => void
  deleteAsset: (id: string) => void

  addSnapshot: (
    investmentId: string,
    value: number,
    currency: string,
    recordedAt: string,
    note: string,
    rates: AppSettings['exchangeRates']
  ) => void
  updateSnapshot: (
    snapshotId: string,
    value: number,
    recordedAt: string,
    note: string,
    rates: AppSettings['exchangeRates']
  ) => void
  deleteSnapshot: (snapshotId: string) => void
  updateTrackingSettings: (investmentId: string, patch: Partial<InvestmentTracking>) => void

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
      assets: [],
      snapshots: [],
      trackingSettings: [],
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
        set((state) => {
          const accounts = state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a))
          if (!data.name) return { accounts }
          const newName = accounts.find((a) => a.id === id)!.name
          const priorityConfig = state.priorityConfig.map((p) => {
            if (p.id !== id) return p
            if (p.type === 'bank_savings') return { ...p, label: `${newName} — Savings` }
            if (p.type === 'bank_deposits') return { ...p, label: `${newName} — Deposits` }
            if (p.type === 'bank_balance') return { ...p, label: `${newName} — Liquid Balance` }
            return p
          })
          return { accounts, priorityConfig }
        })
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          priorityConfig: state.priorityConfig.filter((p) => p.id !== id),
        }))
      },

      addInvestment: (data) => {
        const id = `inv-${Date.now()}`
        const now = new Date().toISOString()
        const investment: Investment = { ...data, id, createdAt: now }
        set((state) => {
          const investments = [...state.investments, investment]
          // Create initial snapshot if balance > 0
          const snapshots = data.balance > 0
            ? [
                ...state.snapshots,
                {
                  id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  investmentId: id,
                  value: data.balance,
                  currency: data.currency,
                  valueILS: convertAmount(data.balance, data.currency, 'ILS', state.settings.exchangeRates),
                  note: 'Initial value',
                  recordedAt: now,
                } as InvestmentSnapshot,
              ]
            : state.snapshots
          return {
            investments,
            snapshots,
            priorityConfig: buildSyncedPriority(state.priorityConfig, state.accounts, investments),
          }
        })
      },

      updateInvestment: (id, data) => {
        set((state) => {
          const investments = state.investments.map((i) => (i.id === id ? { ...i, ...data } : i))
          if (!data.name) return { investments }
          const newName = investments.find((i) => i.id === id)!.name
          const priorityConfig = state.priorityConfig.map((p) =>
            p.type === 'investment' && p.id === id ? { ...p, label: newName } : p
          )
          return { investments, priorityConfig }
        })
      },

      deleteInvestment: (id) => {
        set((state) => ({
          investments: state.investments.filter((i) => i.id !== id),
          snapshots: state.snapshots.filter((s) => s.investmentId !== id),
          trackingSettings: state.trackingSettings.filter((t) => t.investmentId !== id),
          priorityConfig: state.priorityConfig.filter((p) => !(p.type === 'investment' && p.id === id)),
        }))
      },

      addAsset: (data) => {
        const asset: Asset = { ...data, id: `asset-${Date.now()}`, createdAt: new Date().toISOString() }
        set((state) => ({ assets: [...state.assets, asset] }))
      },

      updateAsset: (id, data) => {
        set((state) => ({ assets: state.assets.map((a) => (a.id === id ? { ...a, ...data } : a)) }))
      },

      deleteAsset: (id) => {
        set((state) => ({ assets: state.assets.filter((a) => a.id !== id) }))
      },

      addSnapshot: (investmentId, value, currency, recordedAt, note, rates) => {
        set((state) => {
          const valueILS = convertAmount(value, currency, 'ILS', rates)
          const snapshot: InvestmentSnapshot = {
            id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            investmentId,
            value,
            currency,
            valueILS,
            note,
            recordedAt,
          }
          // Update investment.balance to match new snapshot value
          const investments = state.investments.map((i) =>
            i.id === investmentId ? { ...i, balance: value } : i
          )
          // Update lastLoggedAt in trackingSettings
          const existingTracking = state.trackingSettings.find((t) => t.investmentId === investmentId)
          const trackingSettings = existingTracking
            ? state.trackingSettings.map((t) =>
                t.investmentId === investmentId ? { ...t, lastLoggedAt: recordedAt } : t
              )
            : [
                ...state.trackingSettings,
                { investmentId, frequency: 'monthly' as TrackingFrequency, lastLoggedAt: recordedAt },
              ]
          return { snapshots: [...state.snapshots, snapshot], investments, trackingSettings }
        })
      },

      updateSnapshot: (snapshotId, value, recordedAt, note, rates) => {
        set((state) => {
          const snap = state.snapshots.find((s) => s.id === snapshotId)
          if (!snap) return {}
          const valueILS = convertAmount(value, snap.currency, 'ILS', rates)
          const snapshots = state.snapshots.map((s) =>
            s.id === snapshotId ? { ...s, value, valueILS, recordedAt, note } : s
          )
          // Sync investment.balance to latest snapshot
          const sorted = snapshots
            .filter((s) => s.investmentId === snap.investmentId)
            .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
          const investments = state.investments.map((i) =>
            i.id === snap.investmentId ? { ...i, balance: sorted[0]?.value ?? i.balance } : i
          )
          return { snapshots, investments }
        })
      },

      deleteSnapshot: (snapshotId) => {
        set((state) => {
          const snap = state.snapshots.find((s) => s.id === snapshotId)
          if (!snap) return {}
          const remaining = state.snapshots.filter((s) => s.id !== snapshotId)
          // Sync investment.balance to latest remaining snapshot for this investment
          const sibling = [...remaining]
            .filter((s) => s.investmentId === snap.investmentId)
            .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]
          const investments = state.investments.map((i) =>
            i.id === snap.investmentId ? { ...i, balance: sibling?.value ?? i.balance } : i
          )
          return { snapshots: remaining, investments }
        })
      },

      updateTrackingSettings: (investmentId, patch) => {
        set((state) => {
          const exists = state.trackingSettings.some((t) => t.investmentId === investmentId)
          if (exists) {
            return {
              trackingSettings: state.trackingSettings.map((t) =>
                t.investmentId === investmentId ? { ...t, ...patch } : t
              ),
            }
          }
          return {
            trackingSettings: [
              ...state.trackingSettings,
              { investmentId, frequency: 'monthly', lastLoggedAt: null, ...patch },
            ],
          }
        })
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
            userProfile: { ...state.settings.userProfile, ...(newSettings.userProfile ?? {}) },
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
          state.assets = SAMPLE_ASSETS
          state.snapshots = SAMPLE_SNAPSHOTS
          state.priorityConfig = buildPriorityFromData(SAMPLE_ACCOUNTS, SAMPLE_INVESTMENTS)
          state.sampleDataLoaded = true
          state.sampleDataDismissed = false
        }
        if (state) {
          if (!state.settings) state.settings = DEFAULT_SETTINGS
          // Migrate missing fields added in later versions
          if (!state.settings.theme) state.settings.theme = 'dark'
          if (!state.settings.userProfile) state.settings.userProfile = { name: '', age: '', avatarDataUrl: '' }
          if (!state.settings.exchangeRates.GBP_ILS) state.settings.exchangeRates.GBP_ILS = 4.60
          if (!(['ILS','USD','EUR','GBP'] as string[]).includes(state.settings.displayCurrency)) {
            state.settings.displayCurrency = 'ILS'
          }
          // Migrate assets
          if (!state.assets) state.assets = []
          // Migrate snapshots / trackingSettings
          if (!state.snapshots) state.snapshots = []
          if (!state.trackingSettings) state.trackingSettings = []
          // Seed one snapshot per existing investment that has no snapshot yet
          for (const inv of state.investments) {
            const hasSnap = state.snapshots.some((s) => s.investmentId === inv.id)
            if (!hasSnap && inv.balance > 0) {
              state.snapshots.push({
                id: `snap-migrate-${inv.id}`,
                investmentId: inv.id,
                value: inv.balance,
                currency: inv.currency,
                valueILS: convertAmount(inv.balance, inv.currency, 'ILS', state.settings.exchangeRates),
                note: 'Initial value',
                recordedAt: inv.createdAt,
              })
            }
          }
        }
      },
    }
  )
)

export { ACCOUNT_COLORS }
