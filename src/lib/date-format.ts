import { fromKey } from './date'

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})
const monthLabelFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const monthChipFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

function toDate(value: Date | string) {
  return typeof value === 'string' ? fromKey(value) : value
}

export function formatLongDate(value: Date | string) {
  return longDateFormatter.format(toDate(value))
}

export function formatMonthLabel(value: Date | string) {
  return monthLabelFormatter.format(toDate(value))
}

export function formatMonthChip(value: Date | string) {
  return monthChipFormatter.format(toDate(value))
}
