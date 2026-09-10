export function fromKey(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`)
}

export function getDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function monthKey(value: Date | string = new Date()) {
  return (typeof value === 'string' ? value : getDayKey(value)).slice(0, 7)
}

export function getCurrentTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function monthDays(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function entryDate(entry: { occurredAt: string }) {
  return entry.occurredAt.slice(0, 10)
}
