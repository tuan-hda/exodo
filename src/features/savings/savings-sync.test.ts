import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AutomaticSavingsPlanItem } from './savings-utils'
import { applyAutomaticSavingsPlan, calculateSavingsOncePerMonth, deleteSavingsContribution } from './savings-sync'

function createSupabaseStub(
  calls: string[],
  deleteError: Error | null = null,
  monthly: { lastCalculatedMonth?: string; insertError?: Error; saveError?: Error } = {},
) {
  let lastCalculatedMonth = monthly.lastCalculatedMonth
  return {
    from(table: string) {
      let deleting = false
      const query = {
        delete() {
          deleting = true
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
          return Promise.resolve({ error: monthly.insertError ?? null })
        },
        select() {
          return query
        },
        maybeSingle() {
          return Promise.resolve({
            data: lastCalculatedMonth ? { last_calculated_month: lastCalculatedMonth } : null,
            error: null,
          })
        },
        upsert(payload: { last_calculated_month: string }) {
          if (!monthly.saveError) lastCalculatedMonth = payload.last_calculated_month
          calls.push(`upsert:${table}:${JSON.stringify(payload)}`)
          return Promise.resolve({ error: monthly.saveError ?? null })
        },
        then(resolve: (value: { error: Error | null }) => unknown) {
          return Promise.resolve({ error: deleting ? deleteError : null }).then(resolve)
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

const manualDeposit = {
  id: 'manual-1',
  goalId: goal.id,
  amount: 250,
  occurredAt: '2026-09-01T00:00:00Z',
  source: 'manual' as const,
  monthKey: null,
  note: null,
}

describe('once-per-month savings calculation', () => {
  it('does not recreate a deleted contribution when the month is already calculated', async () => {
    const calls: string[] = []
    const supabase = createSupabaseStub(calls, null, { lastCalculatedMonth: '2026-10' })
    expect(await calculateSavingsOncePerMonth(supabase, 'user-1', [goal], 500, '2026-10')).toBe(false)
    expect(calls).toEqual(['eq:savings_automation_state:user_id:user-1'])
  })

  it('calculates a new month and records its completion after allocating', async () => {
    const calls: string[] = []
    const supabase = createSupabaseStub(calls, null, { lastCalculatedMonth: '2026-09' })
    expect(await calculateSavingsOncePerMonth(supabase, 'user-1', [goal], 500, '2026-10')).toBe(true)
    expect(calls).toContain('update:savings_goals:{"saved_amount":1500}')
    expect(calls.at(-1)).toBe('upsert:savings_automation_state:{"user_id":"user-1","last_calculated_month":"2026-10"}')
  })

  it('calculates once even when the remainder or goal changes later in the month', async () => {
    const calls: string[] = []
    const supabase = createSupabaseStub(calls)
    await calculateSavingsOncePerMonth(supabase, 'user-1', [goal], 500, '2026-10')
    calls.length = 0
    expect(
      await calculateSavingsOncePerMonth(supabase, 'user-1', [{ ...goal, savedAmount: 1_500 }], 900, '2026-10'),
    ).toBe(false)
    expect(calls).toEqual(['eq:savings_automation_state:user_id:user-1'])
  })

  it('marks a zero-remainder month as calculated too', async () => {
    const calls: string[] = []
    expect(await calculateSavingsOncePerMonth(createSupabaseStub(calls), 'user-1', [goal], 0, '2026-10')).toBe(false)
    expect(calls.at(-1)).toBe('upsert:savings_automation_state:{"user_id":"user-1","last_calculated_month":"2026-10"}')
  })

  it('does not mark a month complete when allocation fails', async () => {
    const calls: string[] = []
    const error = new Error('Insert failed')
    const supabase = createSupabaseStub(calls, null, { insertError: error })
    await expect(calculateSavingsOncePerMonth(supabase, 'user-1', [goal], 500, '2026-10')).rejects.toThrow(error)
    expect(calls.some((call) => call.startsWith('upsert:'))).toBe(false)
  })
})

describe('deleting savings contributions', () => {
  it('deletes the contribution and subtracts it from the user-owned goal', async () => {
    const calls: string[] = []
    expect(await deleteSavingsContribution(createSupabaseStub(calls), 'user-1', manualDeposit, goal)).toBe(750)
    expect(calls).toContain('update:savings_goals:{"saved_amount":750}')
    expect(calls).toContain('delete:savings_deposits')
    expect(calls).toContain('eq:savings_goals:user_id:user-1')
    expect(calls).toContain('eq:savings_deposits:user_id:user-1')
    expect(calls).toContain('eq:savings_deposits:goal_id:goal-1')
  })

  it('restores the saved total when deletion fails', async () => {
    const calls: string[] = []
    const error = new Error('Delete failed')
    await expect(
      deleteSavingsContribution(createSupabaseStub(calls, error), 'user-1', manualDeposit, goal),
    ).rejects.toThrow(error)
    expect(calls.at(-3)).toBe('update:savings_goals:{"saved_amount":1000}')
  })

  it('does not reduce the saved total below zero', async () => {
    expect(
      await deleteSavingsContribution(createSupabaseStub([]), 'user-1', { ...manualDeposit, amount: 1200 }, goal),
    ).toBe(0)
  })
})

describe('automatic savings persistence', () => {
  it('inserts contributions and increases balances without updating or deleting deposit rows', async () => {
    const calls: string[] = []
    const plan: AutomaticSavingsPlanItem[] = [{ goal, amount: 150, nextSavedAmount: 1_150 }]

    expect(await applyAutomaticSavingsPlan(createSupabaseStub(calls), 'user-1', plan, '2026-10')).toBe(true)
    const inserted = JSON.parse(
      calls.find((call) => call.startsWith('insert:savings_deposits:'))!.split('insert:savings_deposits:')[1],
    )
    expect(inserted).toMatchObject({
      user_id: 'user-1',
      goal_id: goal.id,
      amount: 150,
      source: 'automatic',
      month_key: '2026-10',
    })
    expect(calls).toContain('update:savings_goals:{"saved_amount":1150}')
    expect(calls.some((call) => call.startsWith('delete:') || call.startsWith('update:savings_deposits:'))).toBe(false)
  })

  it('makes no writes when there are no allocations', async () => {
    const calls: string[] = []
    expect(await applyAutomaticSavingsPlan(createSupabaseStub(calls), 'user-1', [], '2026-10')).toBe(false)
    expect(calls).toEqual([])
  })
})
