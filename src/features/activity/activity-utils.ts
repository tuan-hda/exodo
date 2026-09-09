import { entryDate, monthKey } from '@/lib/date'
import { formatLongDate, formatMonthChip, formatMonthLabel } from '@/lib/date-format'
import type { Entry } from '@/features/entries/types'

export type ActivityDay = { key: string; label: string; entries: Entry[] }
export type ActivityMonth = { key: string; label: string; entries: Entry[]; income: number; expense: number }

export function formatActivityMonth(key: string) {
  return formatMonthChip(`${key}-01`)
}

export function filterActivityEntries(entries: Entry[], query: string) {
  const sortedEntries = [...entries].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
  const normalizedQuery = query.trim().toLocaleLowerCase()
  if (!normalizedQuery) return sortedEntries

  return sortedEntries.filter((entry) =>
    [entry.title, entry.category ?? '', entry.type].some((value) =>
      value.toLocaleLowerCase().includes(normalizedQuery),
    ),
  )
}

export function groupActivityByDate(entries: Entry[]) {
  return entries.reduce<ActivityDay[]>((groups, entry) => {
    const key = entryDate(entry)
    const group = groups.find((item) => item.key === key)
    if (group) group.entries.push(entry)
    else groups.push({ key, label: formatLongDate(key), entries: [entry] })
    return groups
  }, [])
}

export function groupActivityByMonth(entries: Entry[]) {
  return entries.reduce<ActivityMonth[]>((groups, entry) => {
    const key = monthKey(entryDate(entry))
    const group = groups.find((item) => item.key === key)
    if (group) {
      group.entries.push(entry)
      if (entry.type === 'income') group.income += entry.amount
      else group.expense += entry.amount
    } else {
      groups.push({
        key,
        label: formatMonthLabel(`${key}-01`),
        entries: [entry],
        income: entry.type === 'income' ? entry.amount : 0,
        expense: entry.type === 'expense' ? entry.amount : 0,
      })
    }
    return groups
  }, [])
}
