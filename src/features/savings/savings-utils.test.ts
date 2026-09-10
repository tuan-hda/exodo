import { describe, expect, it } from 'vitest'
import { monthKey } from '@/lib/date'
import {
  allocateRemainder,
  buildAutomaticSavingsPlan,
  calculateMonthlyRemainder,
  getAutomaticSavingsBaseline,
  normalizeSavingsDeposit,
  normalizeSavingsGoal,
} from './savings-utils'
import type { SavingsDeposit, SavingsGoal } from './types'

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

  it('removes current-month automatic deposits before recalculating allocations', () => {
    const goals = [goal('first', 1, 2_000), { ...goal('second', 2), savedAmount: 500 }]
    const deposits: SavingsDeposit[] = [
      {
        id: 'automatic',
        goalId: 'first',
        amount: 400,
        occurredAt: '2026-09-10T12:00:00.000Z',
        source: 'automatic',
        monthKey: '2026-09',
        note: 'Monthly remainder',
      },
    ]

    expect(getAutomaticSavingsBaseline(goals, deposits, '2026-09')).toMatchObject([
      { id: 'first', savedAmount: 0 },
      { id: 'second', savedAmount: 500 },
    ])
  })

  it('builds a deterministic reconciliation plan and isolates duplicate deposits', () => {
    const goals = [{ ...goal('first', 1, 2_000), savedAmount: 500 }, goal('second', 2)]
    const deposits: SavingsDeposit[] = [
      {
        id: 'primary',
        goalId: 'first',
        amount: 400,
        occurredAt: '2026-09-10T12:00:00.000Z',
        source: 'automatic',
        monthKey: '2026-09',
        note: 'Monthly remainder',
      },
      {
        id: 'duplicate',
        goalId: 'first',
        amount: 100,
        occurredAt: '2026-09-09T12:00:00.000Z',
        source: 'automatic',
        monthKey: '2026-09',
        note: 'Monthly remainder',
      },
    ]

    expect(buildAutomaticSavingsPlan(goals, deposits, 2_500, '2026-09')).toMatchObject([
      {
        goal: { id: 'first' },
        amount: 2_000,
        existingAmount: 500,
        primaryDeposit: { id: 'primary' },
        duplicateDeposits: [{ id: 'duplicate' }],
        nextSavedAmount: 2_000,
      },
      {
        goal: { id: 'second' },
        amount: 500,
        existingAmount: 0,
        primaryDeposit: null,
        duplicateDeposits: [],
        nextSavedAmount: 500,
      },
    ])
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
