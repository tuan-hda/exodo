import { entryDate } from '../entries/entry-utils'
import type { Entry } from '../entries/types'

export type AnalysisSlice = {
  category: string
  amount: number
  percentage: number
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
    .reduce<Record<string, number>>((groups, entry) => {
      const category = entry.category || 'Other'
      groups[category] = (groups[category] ?? 0) + entry.amount
      return groups
    }, {})
  const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0)

  return Object.entries(totals)
    .sort(([, left], [, right]) => right - left)
    .map(([category, amount]) => ({ category, amount, percentage: total ? amount / total : 0 }))
}

export function formatPercentage(value: number) {
  return `${Math.round(value * 100)}%`
}
