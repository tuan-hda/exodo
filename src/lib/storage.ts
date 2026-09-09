export const storageCacheTtl = 24 * 60 * 60 * 1000

export function readStorageValue(key: string) {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorageValue(key: string, value: string) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, value)
  } catch {
    return
  }
}

export function readStorageJson<T>(key: string) {
  const value = readStorageValue(key)
  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function writeStorageJson<T>(key: string, value: T) {
  try {
    writeStorageValue(key, JSON.stringify(value))
  } catch {
    return
  }
}

export function readStorageCache<T extends object>(key: string, maxAgeMs: number) {
  const cached = readStorageJson<T & { cachedAt?: number }>(key)
  if (
    !cached ||
    typeof cached.cachedAt !== 'number' ||
    !Number.isFinite(cached.cachedAt) ||
    Date.now() - cached.cachedAt > maxAgeMs
  )
    return null
  return cached as T
}

export function writeStorageCache<T extends object>(key: string, value: T) {
  writeStorageJson(key, { ...value, cachedAt: Date.now() })
}
