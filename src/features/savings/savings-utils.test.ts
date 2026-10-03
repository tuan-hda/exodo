import { describe, expect, it } from 'vitest'
import { monthKey } from '@/lib/date'
import {
  allocateRemainder,
  buildAutomaticSavingsPlan,
  calculateMonthlyRemainder,
  normalizeSavingsDeposit,
  normalizeSavingsGoal,
  reorderSavingsGoals,
} from './savings-utils'
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
  it('persists reordered priorities without changing goal balances and uses the new allocation order', () => {
    const goals = [{ ...goal('first', 0), savedAmount: 100 }, goal('second', 1)]
    const reordered = reorderSavingsGoals(goals, ['second', 'first'])!
    expect(reordered.map(({ id, priority, savedAmount }) => ({ id, priority, savedAmount }))).toEqual([
      { id: 'second', priority: 0, savedAmount: 0 },
      { id: 'first', priority: 1, savedAmount: 100 },
    ])
    expect(allocateRemainder(reordered, 500)).toEqual([{ goalId: 'second', amount: 500 }])
    expect(goals[0].priority).toBe(0)
  })

  it('rejects incomplete, duplicate, or unknown goal orders', () => {
    const goals = [goal('first', 0), goal('second', 1)]
    expect(reorderSavingsGoals(goals, ['first'])).toBeNull()
    expect(reorderSavingsGoals(goals, ['first', 'first'])).toBeNull()
    expect(reorderSavingsGoals(goals, ['first', 'unknown'])).toBeNull()
  })

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

  it('allocates from current saved balances without subtracting earlier contributions', () => {
    const goals = [{ ...goal('first', 1, 2_000), savedAmount: 500 }, goal('second', 2)]
    expect(buildAutomaticSavingsPlan(goals, 2_000)).toMatchObject([
      { goal: { id: 'first', savedAmount: 500 }, amount: 1_500, nextSavedAmount: 2_000 },
      { goal: { id: 'second', savedAmount: 0 }, amount: 500, nextSavedAmount: 500 },
    ])
    expect(goals[0].savedAmount).toBe(500)
  })

  it('creates no contributions for a zero remainder or full and paused goals', () => {
    expect(buildAutomaticSavingsPlan([goal('first', 0)], 0)).toEqual([])
    expect(
      buildAutomaticSavingsPlan(
        [
          { ...goal('full', 0), savedAmount: 1_000 },
          { ...goal('paused', 1), status: 'paused' },
        ],
        500,
      ),
    ).toEqual([])
  })

  it('normalizes persisted goals and deposits while rejecting malformed rows', () => {
    expect(
      normalizeSavingsGoal({
        id: 'goal',
        name: 'Japan trip',
        target_amount: '3000000',
        saved_amount: 500000,
        target_date: '2027-06-01',
        icon: 'airplane',
        priority: 1,
        status: 'active',
      }),
    ).toEqual({
      id: 'goal',
      name: 'Japan trip',
      targetAmount: 3_000_000,
      savedAmount: 500_000,
      targetDate: '2027-06-01',
      icon: 'airplane',
      priority: 1,
      status: 'active',
    })
    expect(
      normalizeSavingsDeposit({
        id: 'deposit',
        goal_id: 'goal',
        amount: '250000',
        occurred_at: '2026-09-10T12:00:00.000Z',
        source: 'automatic',
        month_key: '2026-09',
        note: 'Monthly remainder',
      }),
    ).toMatchObject({ id: 'deposit', goalId: 'goal', amount: 250_000, source: 'automatic' })
    expect(normalizeSavingsGoal({ id: 'goal', target_amount: 'not-a-number' })).toBeNull()
    expect(normalizeSavingsDeposit({ id: 'deposit', goal_id: 'goal', amount: 0 })).toBeNull()
  })
})
