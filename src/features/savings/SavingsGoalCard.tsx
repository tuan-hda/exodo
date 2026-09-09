import { Plus } from '@phosphor-icons/react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'
import { formatShort } from '../entries/entry-utils'
import type { SavingsDeposit, SavingsGoal } from './types'

export function SavingsGoalCard({
  goal,
  deposits,
  onAdd,
}: {
  goal: SavingsGoal
  deposits: SavingsDeposit[]
  onAdd?: (goalId: string) => void
}) {
  const percentage = goal.targetAmount ? Math.min(100, (goal.savedAmount / goal.targetAmount) * 100) : 0
  const recentDeposits = deposits.filter((deposit) => deposit.goalId === goal.id).slice(0, 4)
  return (
    <Card className="p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-[14px] bg-ink text-xl text-white" aria-hidden="true">
            {goal.icon || '✈️'}
          </span>
          <div>
            <h2 className="text-lg font-semibold">{goal.name}</h2>
            <p className="mt-1 text-xs text-muted">
              {goal.targetDate
                ? `By ${new Date(`${goal.targetDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                : 'No deadline'}
            </p>
          </div>
        </div>
        {onAdd && (
          <Button variant="outline" size="sm" type="button" onClick={() => onAdd(goal.id)}>
            <Plus size={15} /> Add
          </Button>
        )}
      </div>
      <div className="mt-5 flex items-end justify-between text-sm">
        <span>
          <strong className="ui-number text-xl font-semibold">{formatShort(goal.savedAmount)}</strong> saved
        </span>
        <span className="ui-number text-xs text-muted">{Math.round(percentage)}%</span>
      </div>
      <Progress className="mt-3" value={percentage} tone="success" />
      <div className="mt-3 flex justify-between text-xs text-muted">
        <span className="ui-number">{formatShort(Math.max(0, goal.targetAmount - goal.savedAmount))} remaining</span>
        <span className="ui-number">Target {formatShort(goal.targetAmount)}</span>
      </div>
      {recentDeposits.length > 0 && (
        <div className="mt-5 border-t border-line pt-3">
          <p className="ui-eyebrow mb-2">Recent contributions</p>
          {recentDeposits.map((deposit) => (
            <div className="flex justify-between py-1 text-xs" key={deposit.id}>
              <span>{deposit.source === 'automatic' ? 'Monthly remainder' : 'Manual deposit'}</span>
              <strong>+{formatShort(deposit.amount)}</strong>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
