import { isEntry, isEntryType, type Entry, type EntryType } from './types'
import { readStorageCache, storageCacheTtl, writeStorageCache } from '@/lib/storage'
import { isRecord } from '@/lib/guards'

export function normalizeStoredEntry(value: unknown): Entry | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.type !== 'string' || !isEntryType(value.type)) {
    return null
  }
  const amount = Number(value.amount)
  if (!Number.isFinite(amount) || amount < 0 || typeof value.occurred_at !== 'string') return null

  return {
    id: value.id,
    type: value.type,
    amount,
    occurredAt: value.occurred_at.slice(0, 16),
    title: typeof value.title === 'string' ? value.title : '',
    category: typeof value.category === 'string' && value.category ? value.category : 'Other',
  }
}

export function calculateAccumulation(entries: Entry[]) {
  return entries.reduce((total, entry) => total + (entry.type === 'income' ? entry.amount : -entry.amount), 0)
}

export function sumEntriesByType(entries: Entry[], type: EntryType) {
  return entries.reduce((total, entry) => total + (entry.type === type ? entry.amount : 0), 0)
}

function entriesCacheKey(userId: string) {
  return `exodo.entries.${userId}`
}

export function readEntriesCache(userId: string) {
  const cached = readStorageCache<{ entries?: unknown }>(entriesCacheKey(userId), storageCacheTtl)
  if (!Array.isArray(cached?.entries)) return null
  return cached.entries.filter(isEntry)
}

export function writeEntriesCache(userId: string, entries: Entry[]) {
  writeStorageCache(entriesCacheKey(userId), { entries })
}
