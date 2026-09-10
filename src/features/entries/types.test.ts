import { describe, expect, it } from 'vitest'
import { isEntryType } from './types'

describe('entry type guard', () => {
  it('accepts supported entry types', () => {
    expect(isEntryType('income')).toBe(true)
    expect(isEntryType('expense')).toBe(true)
  })

  it('rejects unsupported values', () => {
    expect(isEntryType('transfer')).toBe(false)
    expect(isEntryType('')).toBe(false)
  })
})
