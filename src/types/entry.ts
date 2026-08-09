import type { Category } from '../components/CategoryPicker'

export type EntryType = 'income' | 'expense'

export type Entry = {
  id: string
  type: EntryType
  amount: number
  occurredAt: string
  title: string
  category?: Category
}

export type StoredEntry = {
  id: string
  type: EntryType
  amount: number | string
  occurred_at: string
  title: string | null
  category: string | null
}
