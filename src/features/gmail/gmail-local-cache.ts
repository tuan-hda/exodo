import { parseGmailMessagePage, type GmailMessagePage } from './types'

export const GMAIL_MESSAGES_CACHE_TTL_MS = 12 * 60 * 60 * 1000

const CACHE_KEY_PREFIX = 'exodo:gmail-messages:v1:'
const cacheKey = (email: string) => `${CACHE_KEY_PREFIX}${email.trim().toLowerCase()}`

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>
type CachedGmailMessagePage = GmailMessagePage & { cachedAt: number }

function getBrowserStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function removeCacheEntry(storage: StorageLike, key: string) {
  try {
    storage.removeItem(key)
  } catch {
    // Ignore browser storage failures.
  }
}

export function readGmailMessagesCache(
  email: string,
  storage: StorageLike | null = getBrowserStorage(),
  now = Date.now(),
): GmailMessagePage | null {
  if (!email || !storage) return null
  const key = cacheKey(email)

  try {
    const value: unknown = JSON.parse(storage.getItem(key) ?? 'null')
    if (
      typeof value !== 'object' ||
      value === null ||
      !('cachedAt' in value) ||
      typeof value.cachedAt !== 'number' ||
      !Number.isFinite(value.cachedAt) ||
      now < value.cachedAt ||
      now - value.cachedAt >= GMAIL_MESSAGES_CACHE_TTL_MS
    ) {
      removeCacheEntry(storage, key)
      return null
    }

    return parseGmailMessagePage(value)
  } catch {
    removeCacheEntry(storage, key)
    return null
  }
}

export function writeGmailMessagesCache(
  email: string,
  page: GmailMessagePage,
  storage: StorageLike | null = getBrowserStorage(),
  now = Date.now(),
) {
  if (!email || !storage) return
  try {
    storage.setItem(cacheKey(email), JSON.stringify({ ...page, cachedAt: now } satisfies CachedGmailMessagePage))
  } catch {
    // Gmail remains usable when browser storage is unavailable or full.
  }
}

export function clearGmailMessagesCache(email: string, storage: StorageLike | null = getBrowserStorage()) {
  if (!email || !storage) return
  try {
    storage.removeItem(cacheKey(email))
  } catch {
    // Ignore browser storage failures and let the next request fetch from Gmail.
  }
}

export function clearAllGmailMessagesCaches(storage: StorageLike | null = getBrowserStorage()) {
  if (!storage) return
  try {
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
      (key): key is string => key?.startsWith(CACHE_KEY_PREFIX) === true,
    )
    for (const key of keys) storage.removeItem(key)
  } catch {
    // Ignore browser storage failures; sign-out should still proceed.
  }
}
