import { describe, expect, it } from 'vitest'
import type { Entry } from '@/features/entries/types'
import { filterActivityEntries, groupActivityByDate, groupActivityByMonth } from './activity-utils'

const entry = (overrides: Partial<Entry>): Entry => ({
  id: 'entry',
  type: 'expense',
  amount: 100,
  occurredAt: '2026-09-10T12:00',
  title: 'Coffee',
  category: 'Dining',
  ...overrides,
})

describe('activity utilities', () => {
  it('sorts records and filters title, category, and type', () => {
    const entries = [
      entry({ id: 'old', occurredAt: '2026-09-08T12:00', title: 'Bus pass', category: 'Transit' }),
      entry({ id: 'new', occurredAt: '2026-09-10T12:00', type: 'income', title: 'Salary', category: 'Salary' }),
    ]

    expect(filterActivityEntries(entries, 'salary').map((item) => item.id)).toEqual(['new'])
    expect(filterActivityEntries(entries, '').map((item) => item.id)).toEqual(['new', 'old'])
  })

  it('groups monthly totals while preserving sorted record order', () => {
    const entries = [
      entry({ id: 'expense', amount: 250, occurredAt: '2026-09-10T12:00' }),
      entry({ id: 'income', type: 'income', amount: 1_000, occurredAt: '2026-09-09T12:00' }),
      entry({ id: 'old', amount: 50, occurredAt: '2026-08-31T12:00' }),
    ]

    const groups = groupActivityByMonth(entries)

    expect(groups[0]).toMatchObject({ key: '2026-09', income: 1_000, expense: 250 })
    expect(groups[0].entries.map((item) => item.id)).toEqual(['expense', 'income'])
    expect(groups[1]).toMatchObject({ key: '2026-08', expense: 50 })
  })

  it('groups records by calendar date', () => {
    const groups = groupActivityByDate([
      entry({ id: 'late', occurredAt: '2026-09-10T20:00' }),
      entry({ id: 'early', occurredAt: '2026-09-10T08:00' }),
      entry({ id: 'other', occurredAt: '2026-09-09T12:00' }),
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0].entries.map((item) => item.id)).toEqual(['late', 'early'])
    expect(groups[1].entries.map((item) => item.id)).toEqual(['other'])
  })
})
