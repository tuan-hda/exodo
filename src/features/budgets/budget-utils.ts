import { entryDate, fromKey, monthDays } from '@/lib/date'
import { isRecord } from '@/lib/guards'
import type { Entry } from '@/features/entries/types'
import { canonicalCategory } from '@/features/finance/category'
import type { CategoryBudget } from './types'

export function remainingDaysInMonth(dayKey: string) {
  const day = fromKey(dayKey)
  return monthDays(day) - day.getDate() + 1
}

export function dailyBudgetAllowance(limit: number, spent: number, daysRemaining: number) {
  if (daysRemaining <= 0) return 0
  return Math.max(limit - spent, 0) / daysRemaining
}

export type BudgetProgressRow = CategoryBudget & {
  spent: number
  remaining: number
  dailyAllowance: number
  percent: number
}

export function buildBudgetProgressRows(
  budgets: CategoryBudget[],
  entries: Entry[],
  monthStart: string,
  daysRemaining: number,
): BudgetProgressRow[] {
  return budgets.map((budget) => {
    const spent = entries
      .filter(
        (entry) =>
          entry.type === 'expense' &&
          canonicalCategory(entry.category ?? 'Other') === canonicalCategory(budget.category) &&
          entryDate(entry).startsWith(monthStart),
      )
      .reduce((sum, entry) => sum + entry.amount, 0)

    return {
      ...budget,
      spent,
      remaining: Math.max(budget.amount - spent, 0),
      dailyAllowance: dailyBudgetAllowance(budget.amount, spent, daysRemaining),
      percent: budget.amount ? (spent / budget.amount) * 100 : 0,
    }
  })
}

export function normalizeBudget(value: unknown): CategoryBudget | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.category !== 'string' || !value.category) {
    return null
  }
  const amount = Number(value.amount)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return { id: value.id, category: value.category, amount }
}
