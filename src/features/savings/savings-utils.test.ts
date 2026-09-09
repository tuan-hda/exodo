import { describe, expect, it } from 'vitest'
import { allocateRemainder, calculateMonthlyRemainder, monthKey } from './savings-utils'
import type { SavingsGoal } from './types'

const goal = (id: string, priority: number, targetAmount = 1_000) =>
  ({
    id,
    name: id,
    targetAmount,
    savedAmount: 0,
    targetDate: null,
    icon: 'airplane',
    priority,
    status: 'active' as const,
  }) satisfies SavingsGoal

describe('savings calculations', () => {
  it('calculates the current month remainder', () => {
    const entries = [
      { id: 'income', type: 'income' as const, amount: 10_000, occurredAt: '2026-09-03T09:00', title: '' },
      { id: 'expense', type: 'expense' as const, amount: 2_500, occurredAt: '2026-09-08T12:00', title: '' },
      { id: 'old', type: 'income' as const, amount: 9_000, occurredAt: '2026-08-31T12:00', title: '' },
    ]

    expect(calculateMonthlyRemainder(entries, new Date('2026-09-09T12:00:00'))).toBe(7_500)
    expect(monthKey(new Date('2026-09-09T12:00:00'))).toBe('2026-09')
  })

  it('allocates remainder by priority and caps each goal', () => {
    const goals = [goal('second', 2), goal('first', 1, 2_000), { ...goal('paused', 0), status: 'paused' as const }]

    expect(allocateRemainder(goals, 2_500)).toEqual([
      { goalId: 'first', amount: 2_000 },
      { goalId: 'second', amount: 500 },
    ])
  })
})
