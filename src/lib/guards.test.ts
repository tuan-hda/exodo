import { describe, expect, it } from 'vitest'
import { isRecord } from './guards'

describe('isRecord', () => {
  it('accepts plain objects and rejects nullish or collection values', () => {
    expect(isRecord({ value: 1 })).toBe(true)
    expect(isRecord(null)).toBe(false)
    expect(isRecord(['value'])).toBe(false)
    expect(isRecord('value')).toBe(false)
  })
})
