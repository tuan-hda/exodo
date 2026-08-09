export type IncomeLike = {
  type: 'income'
  amount: number
  date: string
}

export function toKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function fromKey(value: string) {
  return new Date(`${value}T12:00:00`)
}

export function allocateIncome(income: IncomeLike, dayKey: string) {
  const received = fromKey(income.date)
  const start = received.getDate() <= 15
    ? received
    : new Date(received.getFullYear(), received.getMonth() + 1, 1, 12)
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 12)
  const day = fromKey(dayKey)
  if (day < start || day > end) return 0
  const days = end.getDate() - start.getDate() + 1
  return income.amount / days
}

export function dailyIncome(entries: Array<{ type: string; amount: number; date: string }>, key: string) {
  return entries.filter(entry => entry.type === 'income').reduce((sum, income) => sum + allocateIncome({ ...income, type: 'income' }, key), 0)
}
