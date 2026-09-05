import type { Entry } from '../entries/types'
import type { SavingsGoal } from './types'
export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function calculateMonthlyRemainder(entries: Entry[], date = new Date()) {
  const key = monthKey(date)
  return Math.max(
    0,
    entries
      .filter((entry) => entry.occurredAt.slice(0, 7) === key)
      .reduce((sum, entry) => sum + (entry.type === 'income' ? entry.amount : -entry.amount), 0),
  )
}

export function allocateRemainder(goals: SavingsGoal[], remainder: number) {
  const active = goals
    .filter((goal) => goal.status === 'active' && goal.targetAmount > goal.savedAmount)
    .sort((a, b) => a.priority - b.priority)
  if (!active.length || remainder <= 0) return []
  let remaining = remainder
  return active.flatMap((goal) => {
    const amount = Math.min(remaining, goal.targetAmount - goal.savedAmount)
    remaining -= amount
    return amount > 0 ? [{ goalId: goal.id, amount }] : []
  })
}
