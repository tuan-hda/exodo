import { describe, expect, it } from 'vitest'
import { normalizeStoredEntry, sumEntriesByType } from './entry-utils'

describe('entry normalization', () => {
  it('normalizes a valid stored row', () => {
    expect(
      normalizeStoredEntry({
        id: 'entry',
        type: 'expense',
        amount: '125000',
        occurred_at: '2026-09-10T12:30:00.000Z',
        title: null,
        category: null,
      }),
    ).toEqual({
      id: 'entry',
      type: 'expense',
      amount: 125_000,
      occurredAt: '2026-09-10T12:30',
      title: '',
      category: 'Other',
    })
  })

  it('rejects malformed rows', () => {
    expect(normalizeStoredEntry({ id: 'entry', type: 'transfer', amount: 100 })).toBeNull()
    expect(normalizeStoredEntry({ id: 'entry', type: 'income', amount: 'not-a-number' })).toBeNull()
  })

  it('sums entries by type without mutating the input', () => {
    const entries = [
      { id: 'income', type: 'income' as const, amount: 1_000, occurredAt: '2026-09-10T12:00', title: '' },
      { id: 'expense', type: 'expense' as const, amount: 250, occurredAt: '2026-09-10T13:00', title: '' },
    ]

    expect(sumEntriesByType(entries, 'income')).toBe(1_000)
    expect(sumEntriesByType(entries, 'expense')).toBe(250)
    expect(entries).toHaveLength(2)
  })
})
