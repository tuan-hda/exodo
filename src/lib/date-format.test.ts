import { describe, expect, it } from 'vitest'
import { formatEntryDateTime, formatEntryTime, formatLongDate, formatMonthChip, formatMonthLabel } from './date-format'

describe('shared date formatting', () => {
  it('formats day labels consistently from date keys', () => {
    expect(formatLongDate('2026-09-10')).toBe('Thursday, September 10')
  })

  it('uses long and compact month labels intentionally', () => {
    expect(formatMonthLabel('2026-09-01')).toBe('September 2026')
    expect(formatMonthChip('2026-09-01')).toBe('Sep 2026')
  })

  it('formats entry timestamps consistently for detail rows', () => {
    const timestamp = '2026-09-10T08:30'
    expect(formatEntryDateTime(timestamp)).toBe('2026-09-10 · 08:30')
    expect(formatEntryTime(timestamp)).toBe('08:30')
  })
})
