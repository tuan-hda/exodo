import { fromKey, monthDays } from '@/lib/date'

export function remainingDaysInMonth(dayKey: string) {
  const day = fromKey(dayKey)
  return monthDays(day) - day.getDate() + 1
}

export function dailyBudgetAllowance(limit: number, spent: number, daysRemaining: number) {
  if (daysRemaining <= 0) return 0
  return Math.max(limit - spent, 0) / daysRemaining
}
