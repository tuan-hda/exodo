import { describe, expect, it } from 'vitest'
import { buildBudgetProgressRows, dailyBudgetAllowance, normalizeBudget, remainingDaysInMonth } from './budget-utils'

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

  it('builds category rows from current-month expenses only', () => {
    const rows = buildBudgetProgressRows(
      [{ id: 'budget', category: 'Dining', amount: 4_000_000 }],
      [
        {
          id: 'current',
          type: 'expense',
          amount: 1_000_000,
          occurredAt: '2026-06-08T12:00',
          title: '',
          category: 'Dining',
        },
        {
          id: 'income',
          type: 'income',
          amount: 500_000,
          occurredAt: '2026-06-09T12:00',
          title: '',
          category: 'Income',
        },
        {
          id: 'old',
          type: 'expense',
          amount: 2_000_000,
          occurredAt: '2026-05-31T12:00',
          title: '',
          category: 'Dining',
        },
      ],
      '2026-06-',
      23,
    )

    expect(rows[0]).toMatchObject({
      spent: 1_000_000,
      remaining: 3_000_000,
      dailyAllowance: 3_000_000 / 23,
      percent: 25,
    })
  })

  it('counts legacy category aliases toward the current budget', () => {
    const [row] = buildBudgetProgressRows(
      [{ id: 'budget', category: 'Transit', amount: 1_000_000 }],
      [
        {
          id: 'legacy',
          type: 'expense',
          amount: 250_000,
          occurredAt: '2026-06-08T12:00',
          title: 'Bus pass',
          category: 'Transport',
        },
      ],
      '2026-06-',
      23,
    )

    expect(row.spent).toBe(250_000)
  })

  it('normalizes valid budget rows and ignores malformed rows', () => {
    expect(normalizeBudget({ id: 'budget', category: 'Dining', amount: '4000000' })).toEqual({
      id: 'budget',
      category: 'Dining',
      amount: 4_000_000,
    })
    expect(normalizeBudget({ id: 'budget', category: '', amount: 100 })).toBeNull()
  })
})
