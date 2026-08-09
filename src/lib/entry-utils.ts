import type { Entry } from '../types/entry'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const whole = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })
const accumulationCacheTtl = 60 * 60 * 1000

export const today = new Date()
export const todayKey = today.toISOString().slice(0, 10)
export const currentTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`

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

export function monthDays(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function entryDate(entry: Entry) {
  return entry.occurredAt.slice(0, 10)
}

export function calculateAccumulation(entries: Entry[]) {
  return entries.reduce((total, entry) => total + (entry.type === 'income' ? entry.amount : -entry.amount), 0)
}

function accumulationCacheKey(userId: string) {
  return `exodo.accumulation.${userId}`
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
  localStorage.setItem(accumulationCacheKey(userId), JSON.stringify({ value, cachedAt: Date.now() } satisfies AccumulationCache))
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
