import Anthropic from '@anthropic-ai/sdk'
import type { BankAccount, Investment, PriorityItem } from '../store/useFinanceStore'
import { computeTotalBalance } from '../store/useFinanceStore'

export interface AIAction {
  step: number
  type: 'transfer' | 'withdraw' | 'liquidate' | 'deposit' | 'other'
  source: string
  destination: string
  amount: number
  rationale: string
}

export interface AIAdviceResponse {
  summary: string
  actions: AIAction[]
  warnings: string[]
  alternatives: string[]
}

const SYSTEM_PROMPT = `You are a professional personal financial advisor. The user will provide their complete financial data (bank accounts, investments, priority order) and a financial need or goal.

Your task:
1. Analyze the user's full financial picture
2. Produce a numbered, ordered action plan that STRICTLY respects the user-defined priority order (liquid bank balances first, then savings, then deposits, then investments — in the user's ranked order)
3. Reference specific account and investment names from the data
4. Flag any risks, overdrafts, or concerns
5. Suggest alternatives if applicable

CRITICAL: You MUST respond ONLY with a single valid JSON object. No markdown, no explanation, no code blocks — just raw JSON.

The JSON must match this exact schema:
{
  "summary": "string — brief overview of the recommended approach",
  "actions": [
    {
      "step": 1,
      "type": "transfer | withdraw | liquidate | deposit | other",
      "source": "name of source account/investment",
      "destination": "name of destination account or purpose",
      "amount": 0,
      "rationale": "why this step"
    }
  ],
  "warnings": ["string array of risks or concerns"],
  "alternatives": ["string array of alternative approaches"]
}`

export async function getAIAdvice(
  accounts: BankAccount[],
  investments: Investment[],
  priority: PriorityItem[],
  userNeed: string,
  rates: { USD_ILS: number; EUR_ILS: number }
): Promise<AIAdviceResponse> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('MISSING_API_KEY')
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const financialData = {
    bankAccounts: accounts.map((a) => ({
      name: a.name,
      balanceCurrency: a.balanceCurrency,
      liquidBalance: a.balance,
      totalBalanceILS: computeTotalBalance(a, rates),
      monthlyIncome: a.incomeItems.reduce((s, i) => s + i.amount, 0),
      incomeBreakdown: a.incomeItems.map((i) => ({ label: i.label, amount: i.amount, currency: i.currency })),
      monthlyExpenses: a.expenseItems.reduce((s, i) => s + i.amount, 0),
      expenseBreakdown: a.expenseItems.map((i) => ({ label: i.label, amount: i.amount, currency: i.currency })),
      savings: a.savings,
      fixedDeposits: a.deposits,
      depositsCurrency: a.depositsCurrency,
      linkedStocks: a.stockBalance,
      stockCurrency: a.stockCurrency,
    })),
    investments: investments.map((i) => ({
      name: i.name,
      balance: i.balance,
      currency: i.currency,
      description: i.description,
    })),
    priorityOrder: priority.map((p, idx) => ({
      rank: idx + 1,
      label: p.label,
      type: p.type,
    })),
    exchangeRates: rates,
    totals: {
      totalLiquidILS: accounts.reduce((s, a) => s + computeTotalBalance(a, rates), 0),
      totalSavings: accounts.reduce((s, a) => s + a.savings, 0),
      totalDeposits: accounts.reduce((s, a) => s + a.deposits, 0),
      totalMonthlyIncome: accounts.reduce(
        (s, a) => s + a.incomeItems.reduce((si, i) => si + i.amount, 0),
        0
      ),
      totalMonthlyExpenses: accounts.reduce(
        (s, a) => s + a.expenseItems.reduce((si, i) => si + i.amount, 0),
        0
      ),
      totalInvestments: investments.reduce((s, i) => s + i.balance, 0),
    },
  }

  const userMessage = `Financial Goal/Need: ${userNeed}

My Financial Data:
${JSON.stringify(financialData, null, 2)}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI')
  }

  try {
    const parsed = JSON.parse(content.text) as AIAdviceResponse
    return parsed
  } catch {
    throw new Error('AI returned invalid JSON. Please try again.')
  }
}
