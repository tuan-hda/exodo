import type { SavingsDeposit, SavingsGoal } from './types'
import { SavingsGoalCard } from './SavingsGoalCard'

export function SavingsGoalList({
  goals,
  deposits,
  onAdd,
}: {
  goals: SavingsGoal[]
  deposits: SavingsDeposit[]
  onAdd: (goalId: string) => void
}) {
  return (
    <div className="grid gap-4">
      {goals.map((goal) => (
        <SavingsGoalCard key={goal.id} goal={goal} deposits={deposits} onAdd={onAdd} />
      ))}
    </div>
  )
}
