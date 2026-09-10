import { describe, expect, it } from 'vitest'
import type { Entry } from '@/features/entries/types'
import { formatPercentage, groupByCategory } from './analysis-utils'

const entry = (overrides: Partial<Entry>): Entry => ({
  id: 'entry',
  type: 'expense',
  amount: 100,
  occurredAt: '2026-09-10T12:00',
  title: 'Record',
  category: 'Dining',
  ...overrides,
})

describe('analysis utilities', () => {
  it('combines legacy category aliases into one distribution slice', () => {
    expect(
      groupByCategory(
        [
          entry({ id: 'transit', amount: 300, category: 'Transit' }),
          entry({ id: 'transport', amount: 200, category: 'Transport' }),
        ],
        'expense',
      ),
    ).toEqual([{ category: 'Transit', amount: 500, percentage: 1, transactionCount: 2 }])
  })

  it('rounds percentages for compact labels', () => {
    expect(formatPercentage(0.472)).toBe('47%')
  })
})
