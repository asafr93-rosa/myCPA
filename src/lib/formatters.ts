export function formatCurrency(value: number, currency = 'ILS'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCompact(value: number, currency = 'ILS'): string {
  const symbol = getCurrencySymbol(currency)
  if (Math.abs(value) >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(2)}M`
  if (Math.abs(value) >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`
  return formatCurrency(value, currency)
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    ILS: '₪', USD: '$', EUR: '€', GBP: '£', JPY: '¥',
  }
  return symbols[currency] ?? currency + ' '
}

export function autoFormatInput(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  const parts = cleaned.split('.')
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (parts.length > 1) {
    return `${intPart}.${parts[1].slice(0, 2)}`
  }
  return intPart
}

export function parseFormattedNumber(str: string): number {
  const cleaned = str.replace(/[^0-9.]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export type ExchangeRates = { USD_ILS: number; EUR_ILS: number; GBP_ILS: number }

/** Convert an amount from one currency to another using ILS as the pivot */
export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: { USD_ILS: number; EUR_ILS: number; GBP_ILS?: number }
): number {
  if (fromCurrency === toCurrency) return amount
  const gbp = rates.GBP_ILS ?? 4.60

  // Step 1: convert to ILS
  let inILS = amount
  if (fromCurrency === 'USD') inILS = amount * rates.USD_ILS
  else if (fromCurrency === 'EUR') inILS = amount * rates.EUR_ILS
  else if (fromCurrency === 'GBP') inILS = amount * gbp

  // Step 2: convert ILS to target
  if (toCurrency === 'ILS') return inILS
  if (toCurrency === 'USD') return inILS / rates.USD_ILS
  if (toCurrency === 'EUR') return inILS / rates.EUR_ILS
  if (toCurrency === 'GBP') return inILS / gbp

  return inILS
}

export const CURRENCIES = ['ILS', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'BRL']
export const DISPLAY_CURRENCIES: Array<{ value: 'ILS' | 'USD' | 'EUR' | 'GBP'; label: string; symbol: string }> = [
  { value: 'ILS', label: 'ILS', symbol: '₪' },
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'GBP', label: 'GBP', symbol: '£' },
]
