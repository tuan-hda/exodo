export type SavingsGoal = {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  targetDate: string | null
  icon: string
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

export type StoredSavingsGoal = {
  id: string
  name: string
  target_amount: number | string
  saved_amount: number | string
  target_date: string | null
  icon: string
  priority: number
  status: SavingsGoal['status']
}

export type StoredSavingsDeposit = {
  id: string
  goal_id: string
  amount: number | string
  occurred_at: string
  source: SavingsDeposit['source']
  month_key: string | null
  note: string | null
}
