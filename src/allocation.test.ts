import { describe, expect, it } from 'vitest'
import { allocateIncome } from './allocation'

const income = (date: string, amount = 30_000_000) => ({ type: 'income' as const, date, amount })

describe('income allocation', () => {
  it('allocates June 1 through June 30', () => {
    expect(allocateIncome(income('2026-06-01'), '2026-06-30')).toBe(1_000_000)
  })

  it('allocates June 15 through June 30', () => {
    expect(allocateIncome(income('2026-06-15'), '2026-06-15')).toBe(1_875_000)
    expect(allocateIncome(income('2026-06-15'), '2026-06-30')).toBe(1_875_000)
  })

  it('moves June 16 income to July 1 through July 31', () => {
    expect(allocateIncome(income('2026-06-16'), '2026-06-30')).toBe(0)
    expect(allocateIncome(income('2026-06-16'), '2026-07-31')).toBeCloseTo(30_000_000 / 31)
  })

  it('allocates July 30 income across August 31 days', () => {
    expect(allocateIncome(income('2026-07-30'), '2026-08-01')).toBeCloseTo(30_000_000 / 31)
  })

  it('allocates August 8 income across August 8 through 31', () => {
    expect(allocateIncome(income('2026-08-08'), '2026-08-31')).toBe(1_250_000)
  })

  it('handles leap-year February', () => {
    expect(allocateIncome(income('2028-02-01'), '2028-02-29')).toBeCloseTo(30_000_000 / 29)
  })
})
