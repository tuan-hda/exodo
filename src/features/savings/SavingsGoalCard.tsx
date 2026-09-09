import { Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatMoney } from '@/features/entries/entry-utils'
import { SavingsIcon } from './savings-icons'
import type { SavingsDeposit, SavingsGoal } from './types'
import { formatMonthChip } from '@/lib/date-format'

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
  const statusLabel = goal.status === 'completed' ? 'Complete' : goal.status === 'paused' ? 'Paused' : null
  return (
    <Card className="p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="ui-icon-tile-inverse size-11 rounded-control text-xl" aria-hidden="true">
            <SavingsIcon name={goal.icon} size={21} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{goal.name}</h2>
            <p className="mt-1 text-xs text-muted">
              {goal.targetDate ? `By ${formatMonthChip(goal.targetDate)}` : 'No deadline'}
              {statusLabel && <span> · {statusLabel}</span>}
            </p>
          </div>
        </div>
        {onAdd && goal.status === 'active' && (
          <Button variant="outline" size="sm" type="button" onClick={() => onAdd(goal.id)}>
            <Plus size={15} /> Add
          </Button>
        )}
      </div>
      <div className="mt-5 flex items-end justify-between text-sm">
        <span>
          <strong className="ui-number text-xl font-semibold">{formatMoney(goal.savedAmount)}</strong> saved
        </span>
        <span className="ui-number text-xs text-muted">{Math.round(percentage)}%</span>
      </div>
      <Progress
        className="mt-3"
        value={percentage}
        tone={goal.status === 'paused' ? 'default' : 'success'}
        aria-label={`${goal.name} savings progress`}
      />
      <div className="mt-3 flex justify-between text-xs text-muted">
        <span className="ui-number">{formatMoney(Math.max(0, goal.targetAmount - goal.savedAmount))} remaining</span>
        <span className="ui-number">Target {formatMoney(goal.targetAmount)}</span>
      </div>
      {recentDeposits.length > 0 && (
        <div className="mt-5 border-t border-line pt-3">
          <p className="ui-eyebrow mb-2">Recent contributions</p>
          {recentDeposits.map((deposit) => (
            <div className="flex justify-between py-1 text-xs" key={deposit.id}>
              <span>{deposit.source === 'automatic' ? 'Monthly remainder' : 'Manual deposit'}</span>
              <strong className="ui-number font-normal text-ink">+{formatMoney(deposit.amount)}</strong>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
