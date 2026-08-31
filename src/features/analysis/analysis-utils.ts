import { entryDate } from '../entries/entry-utils'
import type { Entry } from '../entries/types'

export type AnalysisSlice = {
  category: string
  amount: number
  percentage: number
  transactionCount: number
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function getMonthEntries(entries: Entry[], month: Date) {
  const key = monthKey(month)
  return entries.filter((entry) => entryDate(entry).startsWith(key))
}

export function groupByCategory(entries: Entry[], type: Entry['type']): AnalysisSlice[] {
  const totals = entries
    .filter((entry) => entry.type === type)
    .reduce<Record<string, { amount: number; transactionCount: number }>>((groups, entry) => {
      const category = entry.category || 'Other'
      const current = groups[category] ?? { amount: 0, transactionCount: 0 }
      groups[category] = {
        amount: current.amount + entry.amount,
        transactionCount: current.transactionCount + 1,
      }
      return groups
    }, {})
  const total = Object.values(totals).reduce((sum, group) => sum + group.amount, 0)

  return Object.entries(totals)
    .sort(([, left], [, right]) => right.amount - left.amount)
    .map(([category, group]) => ({
      category,
      amount: group.amount,
      percentage: total ? group.amount / total : 0,
      transactionCount: group.transactionCount,
    }))
}

export function formatPercentage(value: number) {
  return `${Math.round(value * 100)}%`
}
