import { describe, expect, it } from 'vitest'
import { dailyBudgetAllowance, remainingDaysInMonth } from './budget-utils'

describe('category budget daily allowance', () => {
  it('includes today in the remaining day count', () => {
    expect(remainingDaysInMonth('2026-06-15')).toBe(16)
  })

  it('handles the last day of a month', () => {
    expect(remainingDaysInMonth('2026-06-30')).toBe(1)
  })

  it('divides the remaining budget across the remaining days', () => {
    expect(dailyBudgetAllowance(4_000_000, 1_672_955, 16)).toBe(145_440.3125)
  })

  it('returns zero when the budget is spent or no days remain', () => {
    expect(dailyBudgetAllowance(4_000_000, 4_100_000, 16)).toBe(0)
    expect(dailyBudgetAllowance(4_000_000, 1_000_000, 0)).toBe(0)
  })
})
