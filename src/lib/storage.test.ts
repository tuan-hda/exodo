import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readStorageCache, writeStorageCache } from './storage'

describe('storage cache', () => {
  const values = new Map<string, string>()

  beforeEach(() => {
    values.clear()
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('round-trips a fresh cache payload', () => {
    writeStorageCache('test', { value: 42 })

    expect(readStorageCache<{ value: number }>('test', 1_000)).toMatchObject({ value: 42 })
  })

  it('rejects a cache after its freshness window', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000)
    writeStorageCache('test', { value: 42 })
    vi.spyOn(Date, 'now').mockReturnValue(2_001)

    expect(readStorageCache<{ value: number }>('test', 1_000)).toBeNull()
  })

  it('rejects a cache whose JSON payload is not an object', () => {
    values.set('test', JSON.stringify(['not', 'a', 'cache']))

    expect(readStorageCache<{ value: number }>('test', 1_000)).toBeNull()
  })
})
