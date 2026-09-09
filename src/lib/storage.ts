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
  writeStorageValue(key, JSON.stringify(value))
}
