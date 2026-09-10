import type { Category } from '@/features/finance/category'
import { isRecord } from '@/lib/guards'

export type EntryType = 'income' | 'expense'

export function isEntryType(value: string): value is EntryType {
  return value === 'income' || value === 'expense'
}

export type Entry = {
  id: string
  type: EntryType
  amount: number
  occurredAt: string
  title: string
  category?: Category
}

export function isEntry(value: unknown): value is Entry {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isEntryType(typeof value.type === 'string' ? value.type : '') &&
    typeof value.amount === 'number' &&
    Number.isFinite(value.amount) &&
    value.amount >= 0 &&
    typeof value.occurredAt === 'string' &&
    typeof value.title === 'string' &&
    (value.category === undefined || typeof value.category === 'string')
  )
}
