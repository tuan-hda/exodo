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
  const percentage = Math.min(100, (goal.savedAmount / goal.targetAmount) * 100)
  const recentDeposits = deposits.filter((deposit) => deposit.goalId === goal.id).slice(0, 4)
  return (
    <Card className="px-[43px] py-[35px] max-[700px]:p-[26px]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-ink text-xl" aria-hidden="true">
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
          <strong className="text-xl">{formatShort(goal.savedAmount)}</strong> saved
        </span>
        <span className="font-mono text-xs text-muted">{Math.round(percentage)}%</span>
      </div>
      <Progress className="mt-3" value={percentage} />
      <div className="mt-3 flex justify-between text-xs text-muted">
        <span>{formatShort(Math.max(0, goal.targetAmount - goal.savedAmount))} remaining</span>
        <span>Target {formatShort(goal.targetAmount)}</span>
      </div>
      {recentDeposits.length > 0 && (
        <div className="mt-5 border-t border-line pt-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[.08em] text-muted">Recent contributions</p>
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
