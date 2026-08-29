import type { Entry, StoredEntry } from './types'
import type { Category } from './category'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const accumulationCacheTtl = 60 * 60 * 1000
const entriesCacheTtl = 24 * 60 * 60 * 1000

export function getDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function getCurrentTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export const todayKey = getDayKey()

type AccumulationCache = {
  value: number
  cachedAt: number
}

export function formatMoney(value: number) {
  return money.format(Math.round(value))
}

export function formatShort(value: number) {
  return `${whole.format(Math.round(value))} ₫`
}

export function formatAmountExpression(value: string) {
  return value.replace(/\d[\d,]*(?:\.\d*)?/g, (token) => {
    const [integer, fraction] = token.split('.')
    const grouped = Number(integer.replace(/,/g, '') || 0).toLocaleString('en-US')
    return fraction === undefined ? grouped : `${grouped}.${fraction}`
  })
}

export function formatMoneyInput(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('en-US') : ''
}

export function monthDays(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function entryDate(entry: Entry) {
  return entry.occurredAt.slice(0, 10)
}

export function normalizeStoredEntry(entry: StoredEntry): Entry {
  return {
    ...entry,
    amount: Number(entry.amount),
    occurredAt: entry.occurred_at.slice(0, 16),
    title: entry.title ?? '',
    category: (entry.category ?? 'Other') as Category,
  }
}

export function calculateAccumulation(entries: Entry[]) {
  return entries.reduce((total, entry) => total + (entry.type === 'income' ? entry.amount : -entry.amount), 0)
}

function accumulationCacheKey(userId: string) {
  return `exodo.accumulation.${userId}`
}

function entriesCacheKey(userId: string) {
  return `exodo.entries.${userId}`
}

export function readEntriesCache(userId: string) {
  try {
    const cached = JSON.parse(localStorage.getItem(entriesCacheKey(userId)) ?? 'null') as {
      entries?: Entry[]
      cachedAt?: number
    } | null
    if (!cached?.entries || !cached.cachedAt || Date.now() - cached.cachedAt > entriesCacheTtl) return null
    return cached.entries
  } catch {
    return null
  }
}

export function writeEntriesCache(userId: string, entries: Entry[]) {
  localStorage.setItem(entriesCacheKey(userId), JSON.stringify({ entries, cachedAt: Date.now() }))
}

export function readAccumulationCache(userId: string) {
  try {
    const cached = JSON.parse(localStorage.getItem(accumulationCacheKey(userId)) ?? 'null') as AccumulationCache | null
    if (!cached || typeof cached.value !== 'number' || Date.now() - cached.cachedAt > accumulationCacheTtl) {
      localStorage.removeItem(accumulationCacheKey(userId))
      return null
    }
    return cached.value
  } catch {
    return null
  }
}

export function writeAccumulationCache(userId: string, value: number) {
  localStorage.setItem(
    accumulationCacheKey(userId),
    JSON.stringify({ value, cachedAt: Date.now() } satisfies AccumulationCache),
  )
}

export function invalidateAccumulationCache(userId: string) {
  localStorage.removeItem(accumulationCacheKey(userId))
}

export function evaluateExpression(value: string) {
  const expression = value.replaceAll('×', '*').replaceAll('÷', '/').replace(/,/g, '').trim()
  let cursor = 0

  function skipSpaces() {
    while (expression[cursor] === ' ') cursor += 1
  }

  function parseExpression(): number {
    let result = parseTerm()
    while (true) {
      skipSpaces()
      const operator = expression[cursor]
      if (operator !== '+' && operator !== '-') return result
      cursor += 1
      const right = parseTerm()
      result = operator === '+' ? result + right : result - right
    }
  }

  function parseTerm(): number {
    let result = parseFactor()
    while (true) {
      skipSpaces()
      const operator = expression[cursor]
      if (operator !== '*' && operator !== '/') return result
      cursor += 1
      const right = parseFactor()
      if (operator === '/' && right === 0) throw new Error('Cannot divide by zero.')
      result = operator === '*' ? result * right : result / right
    }
  }

  function parseFactor(): number {
    skipSpaces()
    if (expression[cursor] === '+') {
      cursor += 1
      return parseFactor()
    }
    if (expression[cursor] === '-') {
      cursor += 1
      return -parseFactor()
    }
    if (expression[cursor] === '(') {
      cursor += 1
      const result = parseExpression()
      skipSpaces()
      if (expression[cursor] !== ')') throw new Error('Close the parentheses.')
      cursor += 1
      return result
    }

    const number = expression.slice(cursor).match(/^(?:\d+(?:\.\d*)?|\.\d+)/)?.[0]
    if (!number) throw new Error('Enter a valid amount.')
    cursor += number.length
    return Number(number)
  }

  if (!expression) throw new Error('Enter an amount greater than zero.')
  const result = parseExpression()
  skipSpaces()
  if (cursor < expression.length || !Number.isFinite(result)) throw new Error('Enter a valid calculation.')
  return result
}
