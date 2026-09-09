import type { Entry, StoredEntry } from './types'
import type { Category } from '@/features/finance/category'
import { readStorageCache, storageCacheTtl, writeStorageCache } from '@/lib/storage'

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

function entriesCacheKey(userId: string) {
  return `exodo.entries.${userId}`
}

export function readEntriesCache(userId: string) {
  const cached = readStorageCache<{ entries?: Entry[] }>(entriesCacheKey(userId), storageCacheTtl)
  if (!Array.isArray(cached?.entries)) return null
  return cached.entries
}

export function writeEntriesCache(userId: string, entries: Entry[]) {
  writeStorageCache(entriesCacheKey(userId), { entries })
}
