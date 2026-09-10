import type { SavingsIconName } from './savings-icons'

export type SavingsGoal = {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  targetDate: string | null
  icon: SavingsIconName
  priority: number
  status: 'active' | 'paused' | 'completed'
}

export type SavingsDeposit = {
  id: string
  goalId: string
  amount: number
  occurredAt: string
  source: 'manual' | 'automatic'
  monthKey: string | null
  note: string | null
}
