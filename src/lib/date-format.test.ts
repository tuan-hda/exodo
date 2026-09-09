import { describe, expect, it } from 'vitest'
import { monthKey } from './date'
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

  it('derives a stable month key from dates and date keys', () => {
    expect(monthKey(new Date('2026-09-10T12:00:00'))).toBe('2026-09')
    expect(monthKey('2026-09-10T08:30')).toBe('2026-09')
  })
})
