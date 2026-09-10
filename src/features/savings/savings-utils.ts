import { monthKey } from '@/lib/date'
import { isRecord } from '@/lib/guards'
import type { Entry } from '@/features/entries/types'
import { normalizeSavingsIcon } from './savings-icons'
import type { SavingsDeposit, SavingsGoal } from './types'

export function roundSavingsAmount(amount: number) {
  return Math.round(amount * 100) / 100
}

export function calculateMonthlyRemainder(entries: Entry[], date = new Date()) {
  const key = monthKey(date)
  return Math.max(
    0,
    entries
      .filter((entry) => monthKey(entry.occurredAt) === key)
      .reduce((sum, entry) => sum + (entry.type === 'income' ? entry.amount : -entry.amount), 0),
  )
}

function numericValue(value: unknown) {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) return null
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : null
}

function normalizeGoalStatus(status: unknown): SavingsGoal['status'] {
  if (status === 'paused' || status === 'completed') return status
  return 'active'
}

export function normalizeSavingsGoal(value: unknown): SavingsGoal | null {
  if (!isRecord(value)) return null

  const id = typeof value.id === 'string' ? value.id : null
  const name = typeof value.name === 'string' ? value.name : null
  const targetAmount = numericValue(value.target_amount ?? value.targetAmount)
  const savedAmount = numericValue(value.saved_amount ?? value.savedAmount)
  const priority = numericValue(value.priority)
  const targetDateValue = 'target_date' in value ? value.target_date : value.targetDate

  if (
    !id ||
    !name ||
    targetAmount === null ||
    targetAmount <= 0 ||
    savedAmount === null ||
    savedAmount < 0 ||
    priority === null ||
    priority < 0 ||
    !(targetDateValue === null || targetDateValue === undefined || typeof targetDateValue === 'string')
  ) {
    return null
  }

  return {
    id,
    name,
    targetAmount,
    savedAmount,
    targetDate: targetDateValue ?? null,
    icon: normalizeSavingsIcon(typeof value.icon === 'string' ? value.icon : undefined),
    priority,
    status: normalizeGoalStatus(value.status),
  }
}

export function normalizeSavingsDeposit(value: unknown): SavingsDeposit | null {
  if (!isRecord(value)) return null

  const id = typeof value.id === 'string' ? value.id : null
  const goalId =
    typeof value.goal_id === 'string' ? value.goal_id : typeof value.goalId === 'string' ? value.goalId : null
  const amount = numericValue(value.amount)
  const occurredAt =
    typeof value.occurred_at === 'string'
      ? value.occurred_at
      : typeof value.occurredAt === 'string'
        ? value.occurredAt
        : null
  const source = value.source === 'automatic' || value.source === 'manual' ? value.source : null
  const monthKeyValue = 'month_key' in value ? value.month_key : value.monthKey
  const noteValue = 'note' in value ? value.note : null

  if (
    !id ||
    !goalId ||
    amount === null ||
    amount <= 0 ||
    !occurredAt ||
    !source ||
    !(monthKeyValue === null || monthKeyValue === undefined || typeof monthKeyValue === 'string') ||
    !(noteValue === null || noteValue === undefined || typeof noteValue === 'string')
  ) {
    return null
  }

  return {
    id,
    goalId,
    amount,
    occurredAt,
    source,
    monthKey: monthKeyValue ?? null,
    note: noteValue ?? null,
  }
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

export function getAutomaticSavingsBaseline(goals: SavingsGoal[], deposits: SavingsDeposit[], currentMonth: string) {
  const automaticAmounts = new Map<string, number>()
  for (const deposit of deposits) {
    if (deposit.source !== 'automatic' || deposit.monthKey !== currentMonth) continue
    automaticAmounts.set(deposit.goalId, (automaticAmounts.get(deposit.goalId) ?? 0) + deposit.amount)
  }

  return goals.map((goal) => ({
    ...goal,
    savedAmount: Math.max(0, roundSavingsAmount(goal.savedAmount - (automaticAmounts.get(goal.id) ?? 0))),
  }))
}

export type AutomaticSavingsPlanItem = {
  goal: SavingsGoal
  amount: number
  existingAmount: number
  primaryDeposit: SavingsDeposit | null
  duplicateDeposits: SavingsDeposit[]
  nextSavedAmount: number
}

export function buildAutomaticSavingsPlan(
  goals: SavingsGoal[],
  deposits: SavingsDeposit[],
  remainder: number,
  currentMonth: string,
): AutomaticSavingsPlanItem[] {
  const automaticDeposits = deposits.filter(
    (deposit) => deposit.monthKey === currentMonth && deposit.source === 'automatic',
  )
  const depositsByGoal = new Map<string, SavingsDeposit[]>()
  for (const deposit of automaticDeposits) {
    const depositsForGoal = depositsByGoal.get(deposit.goalId) ?? []
    depositsForGoal.push(deposit)
    depositsByGoal.set(deposit.goalId, depositsForGoal)
  }
  const allocations = allocateRemainder(getAutomaticSavingsBaseline(goals, deposits, currentMonth), remainder)
  const desiredAmounts = new Map(
    allocations.map((allocation) => [allocation.goalId, roundSavingsAmount(allocation.amount)]),
  )

  return goals.map((goal) => {
    const existingDeposits = depositsByGoal.get(goal.id) ?? []
    const existingAmount = roundSavingsAmount(existingDeposits.reduce((sum, deposit) => sum + deposit.amount, 0))
    const [primaryDeposit = null, ...duplicateDeposits] = existingDeposits
    const amount = desiredAmounts.get(goal.id) ?? 0
    return {
      goal,
      amount,
      existingAmount,
      primaryDeposit,
      duplicateDeposits,
      nextSavedAmount: Math.max(0, roundSavingsAmount(goal.savedAmount - existingAmount + amount)),
    }
  })
}
