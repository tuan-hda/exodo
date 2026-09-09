import { clsx } from 'clsx'
import { categoryClass, categoryIcon } from '../entries/CategoryPicker'
import { entryDate, formatMoney } from '../entries/entry-utils'
import type { Entry } from '../entries/types'
import type { CategoryBudget } from './types'
import { Progress } from '../../components/ui/progress'
import { Skeleton } from '../../components/ui/skeleton'
import { DashboardPanel } from '../dashboard/DashboardPanel'
import { dailyBudgetAllowance, remainingDaysInMonth } from './budget-utils'

export function BudgetProgress({
  budgets,
  entries,
  isLoading,
  monthStart,
  dayKey,
}: {
  budgets: CategoryBudget[]
  entries: Entry[]
  isLoading: boolean
  monthStart: string
  dayKey: string
}) {
  const daysRemaining = remainingDaysInMonth(dayKey)
  const budgetRows = budgets.map((budget) => {
    const spent = entries
      .filter(
        (entry) =>
          entry.type === 'expense' && entry.category === budget.category && entryDate(entry).startsWith(monthStart),
      )
      .reduce((sum, entry) => sum + entry.amount, 0)
    return {
      ...budget,
      spent,
      dailyAllowance: dailyBudgetAllowance(budget.amount, spent, daysRemaining),
      percent: budget.amount ? (spent / budget.amount) * 100 : 0,
    }
  })

  if (!budgetRows.length && !isLoading) return null

  if (!budgetRows.length) {
    return (
      <DashboardPanel
        className="grid gap-6 p-7 md:p-9"
        label="monthly limits"
        aside="loading"
        ariaLabel="Loading monthly limits"
        ariaBusy>
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-5">
          {Array.from({ length: 2 }, (_, index) => (
            <div className="grid gap-2.5" key={index}>
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-2.5 w-full" />
            </div>
          ))}
        </div>
      </DashboardPanel>
    )
  }

  return (
    <DashboardPanel
      className="p-7 md:p-9"
      label="monthly limits"
      aside={`${budgetRows.length} set`}
      ariaLabel="Monthly limits"
      ariaBusy={isLoading}>
      <div className="flex items-end justify-between gap-4">
        <h3 id="budget-progress-title" className="ui-section-title m-0">
          By category
        </h3>
      </div>
      <div className="mt-7 grid gap-6">
        {budgetRows.map((row) => (
          <div className="grid gap-2.5" key={row.id}>
            <div className="flex items-center justify-between gap-3 font-mono text-xs">
              <span className="flex items-center gap-2">
                <span
                  className={clsx(
                    'grid size-9 shrink-0 place-items-center rounded-[12px] border text-current',
                    categoryClass(row.category),
                  )}>
                  {categoryIcon(row.category, 15)}
                </span>
                {row.category}
              </span>
              <div className="grid justify-items-end gap-0.5 text-right">
                <strong className={clsx('font-normal', row.percent > 100 ? 'text-danger' : 'text-ink')}>
                  {formatMoney(row.spent)} <small className="text-muted">/ {formatMoney(row.amount)}</small>
                </strong>
                <small className="text-[10px] font-normal text-muted">{formatMoney(row.dailyAllowance)} / day</small>
              </div>
            </div>
            <Progress
              value={Math.min(row.percent, 100)}
              tone={row.percent > 100 ? 'danger' : 'default'}
              aria-label={`${row.category} monthly budget progress`}
            />
            {row.percent > 100 && (
              <small className="text-[10px] text-danger">{formatMoney(row.spent - row.amount)} over</small>
            )}
          </div>
        ))}
      </div>
    </DashboardPanel>
  )
}
