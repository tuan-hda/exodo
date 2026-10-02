export const SUPPORTED_CURRENCIES = {
  VND: {
    labels: ['vnd', 'd', '₫'],
    amountFormat: /^[+-]?(?:\d{1,3}(?:[.,]\d{3})+|\d+)$/,
    groupingSeparator: /[.,]/g,
  },
  USD: {
    labels: ['usd'],
    amountFormat: /^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?$/,
    groupingSeparator: /,/g,
  },
} as const

export type Currency = keyof typeof SUPPORTED_CURRENCIES
export type CurrencyConverter = (amount: number, currency: Currency) => number | null

// Fixed Vietcombank USD selling rate, 2026-10-02:
// https://bnews.vn/ty-gia-hom-nay-2-10-gia-usd-tai-cac-ngan-hang-di-len/438954.html
export const VND_RATES = { VND: 1, USD: 26_170 } satisfies Record<Currency, number>

export function convertToVnd(amount: number, currency: Currency): number | null {
  const converted = Math.sign(amount) * Math.round(Math.abs(amount) * VND_RATES[currency])
  return Number.isSafeInteger(converted) ? converted : null
}

export const CURRENCY_LABEL_PATTERN = Object.values(SUPPORTED_CURRENCIES)
  .flatMap(({ labels }) => labels.map((label) => (label === '₫' ? label : `${label}\\b`)))
  .join('|')

export function parseCurrencyAmount(value: string, label: string): { amount: number; currency: Currency } | null {
  const currency = (Object.keys(SUPPORTED_CURRENCIES) as Currency[]).find((currency) =>
    SUPPORTED_CURRENCIES[currency].labels.some((supported) => supported === label.toLowerCase()),
  )
  if (!currency) return null
  const definition = SUPPORTED_CURRENCIES[currency]
  const normalized = value.replace(/\s/g, '')
  if (!definition.amountFormat.test(normalized)) return null
  const amount = Number(normalized.replace(definition.groupingSeparator, ''))
  return Number.isFinite(amount) ? { amount, currency } : null
}
