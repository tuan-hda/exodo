import { describe, expect, it } from 'vitest'
import { defaultSavingsIcon, normalizeSavingsIcon } from './savings-icons'

describe('savings icon normalization', () => {
  it('preserves supported icon names', () => {
    expect(normalizeSavingsIcon('airplane')).toBe('airplane')
  })

  it('falls back for missing or legacy icon names', () => {
    expect(normalizeSavingsIcon('legacy-icon')).toBe(defaultSavingsIcon)
    expect(normalizeSavingsIcon(null)).toBe(defaultSavingsIcon)
  })
})
