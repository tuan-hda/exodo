import { CURRENCY_LABEL_PATTERN, parseCurrencyAmount, type CurrencyConverter } from '@/lib/currency'
import type { GmailTransaction, GmailTransactionSource } from './types'

type TransactionParserDependencies = { convertAmount: CurrencyConverter }

export function createTransactionParser({ convertAmount }: TransactionParserDependencies) {
  return (subject: string, body: string) => parseTransaction(subject, body, convertAmount)
}

export function classifyTransactionSubject(subject: string): GmailTransactionSource | null {
  const title = subject
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
  if (/^\[cake\] thong bao giao dich thanh cong[.!]?$/.test(title)) return 'cake'
  if (
    /^vpbank xin thong bao bien dong so du the tin dung cua quy khach(?: - vpbank would like to inform your credit card['’]s balance change)?[.!]?$/.test(
      title,
    )
  )
    return 'vpbank-credit'
  if (/^vpbank\s*-\s*thong bao bien dong so du\s*\/\s*balance changed[.!]?$/.test(title)) return 'vpbank-debit'
  return null
}

function parseTransactionDate(value: string | undefined): string | null {
  if (!value) return null
  const match = /^(\d{2})\/(\d{2})\/(\d{4})[,\s]+(\d{2}):(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const [, day, month, year, hour, minute, second] = match
  const local = `${year}-${month}-${day}T${hour}:${minute}:${second}`
  const date = new Date(`${local}+07:00`)
  if (!Number.isFinite(date.getTime())) return null
  const normalized = new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 19)
  return normalized === local ? date.toISOString() : null
}

function parseTransaction(subject: string, body: string, convertAmount: CurrencyConverter): GmailTransaction | null {
  const source = classifyTransactionSubject(subject)
  if (!source) return null
  const text = body
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .replace(/[−–—]/g, '-')
    .replace(/[|*]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
  const money = `([+-]?\\s*\\d[\\d.,]*)\\s*(${CURRENCY_LABEL_PATTERN})`
  const amountMatch =
    source === 'cake'
      ? new RegExp(`\\bso tien\\s*:?\\s+${money}`).exec(text)
      : new RegExp(`(?<![\\d.,])${money}\\s+so tien thay doi`).exec(text)
  const moneyValue = amountMatch ? parseCurrencyAmount(amountMatch[1], amountMatch[2]) : null
  const amount = moneyValue ? convertAmount(moneyValue.amount, moneyValue.currency) : null
  const timestamp = '(\\d{2}/\\d{2}/\\d{4}[,\\s]+\\d{2}:\\d{2}:\\d{2})'
  const dateMatch =
    source === 'cake'
      ? new RegExp(`ngay gio giao dich\\s+${timestamp}`).exec(text)
      : new RegExp(`${timestamp}\\s+thoi gian|(?:thoi gian\\s*(?:/\\s*time)?|\\btime)\\s*:?\\s*${timestamp}`).exec(text)
  return { source, amount, occurredAt: parseTransactionDate(dateMatch?.[1] ?? dateMatch?.[2]) }
}
