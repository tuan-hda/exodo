import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { applyAutomaticSavingsPlan } from './savings-sync'
import type { AutomaticSavingsPlanItem } from './savings-utils'

function createSupabaseStub(calls: string[]) {
  return {
    from(table: string) {
      const query = {
        delete() {
          calls.push(`delete:${table}`)
          return query
        },
        update(payload: unknown) {
          calls.push(`update:${table}:${JSON.stringify(payload)}`)
          return query
        },
        eq(column: string, value: string) {
          calls.push(`eq:${table}:${column}:${value}`)
          return query
        },
        insert(payload: unknown) {
          calls.push(`insert:${table}:${JSON.stringify(payload)}`)
          return Promise.resolve({ error: null })
        },
        then(resolve: (value: { error: null }) => unknown) {
          return Promise.resolve({ error: null }).then(resolve)
        },
      }
      return query
    },
  } as unknown as SupabaseClient
}

const goal = {
  id: 'goal-1',
  name: 'Japan',
  targetAmount: 10_000,
  savedAmount: 1_000,
  targetDate: null,
  icon: 'target' as const,
  priority: 0,
  status: 'active' as const,
}

describe('automatic savings persistence', () => {
  it('removes duplicates and reconciles the primary deposit and goal total', async () => {
    const calls: string[] = []
    const plan: AutomaticSavingsPlanItem[] = [
      {
        goal,
        amount: 150,
        existingAmount: 120,
        primaryDeposit: {
          id: 'primary',
          goalId: goal.id,
          amount: 100,
          occurredAt: '2026-09-01T00:00:00Z',
          source: 'automatic',
          monthKey: '2026-09',
          note: null,
        },
        duplicateDeposits: [
          {
            id: 'duplicate',
            goalId: goal.id,
            amount: 20,
            occurredAt: '2026-09-02T00:00:00Z',
            source: 'automatic',
            monthKey: '2026-09',
            note: null,
          },
        ],
        nextSavedAmount: 1_030,
      },
    ]

    const changed = await applyAutomaticSavingsPlan(createSupabaseStub(calls), 'user-1', plan, '2026-09')

    expect(changed).toBe(true)
    expect(calls).toContain('delete:savings_deposits')
    expect(calls).toContain('update:savings_deposits:{"amount":150}')
    expect(calls).toContain('update:savings_goals:{"saved_amount":1030}')
  })

  it('does nothing when the plan already matches persisted values', async () => {
    const calls: string[] = []
    const plan: AutomaticSavingsPlanItem[] = [
      {
        goal,
        amount: 100,
        existingAmount: 100,
        primaryDeposit: {
          id: 'primary',
          goalId: goal.id,
          amount: 100,
          occurredAt: '2026-09-01T00:00:00Z',
          source: 'automatic',
          monthKey: '2026-09',
          note: null,
        },
        duplicateDeposits: [],
        nextSavedAmount: 1_000,
      },
    ]

    const changed = await applyAutomaticSavingsPlan(createSupabaseStub(calls), 'user-1', plan, '2026-09')

    expect(changed).toBe(false)
    expect(calls).toEqual([])
  })
})
