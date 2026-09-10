import { clsx } from 'clsx'
import { CategoryIcon } from '@/features/finance/CategoryIcon'
import type { Entry } from '@/features/entries/types'
import type { CategoryBudget } from './types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardPanel } from '@/features/dashboard/DashboardPanel'
import { buildBudgetProgressRows, remainingDaysInMonth } from './budget-utils'
import { formatMoney } from '@/lib/money'
import { categoryBackgroundClass, categoryForegroundClass, categoryIndicatorClass } from '@/features/finance/category'

export function BudgetProgress({
  budgets,
  entries,
  isLoading,
  monthStart,
  dayKey,
  onOpenSettings,
}: {
  budgets: CategoryBudget[]
  entries: Entry[]
  isLoading: boolean
  monthStart: string
  dayKey: string
  onOpenSettings: () => void
}) {
  const daysRemaining = remainingDaysInMonth(dayKey)
  const budgetRows = buildBudgetProgressRows(budgets, entries, monthStart, daysRemaining)
  const remainingBudget = budgetRows.reduce((sum, row) => sum + row.remaining, 0)
  const dailyPace = budgetRows.reduce((sum, row) => sum + row.dailyAllowance, 0)

  if (!budgetRows.length && !isLoading) {
    return (
      <DashboardPanel
        className="grid gap-5 p-7 md:p-9"
        label="monthly limits"
        aside="not set"
        ariaLabel="Monthly limits are not configured">
        <div className="grid gap-2">
          <h3 className="ui-section-title m-0">Set your pace.</h3>
          <p className="m-0 max-w-[42ch] text-sm leading-[1.6] text-muted">
            Add a category limit and Exodo will show what remains available for each day of the month.
          </p>
        </div>
        <Button variant="outline-muted" size="sm" className="justify-self-start" onClick={onOpenSettings}>
          Set a category limit
        </Button>
      </DashboardPanel>
    )
  }

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
      ariaLabelledBy="budget-progress-title"
      ariaBusy={isLoading}>
      <div className="flex items-end justify-between gap-4">
        <h3 id="budget-progress-title" className="ui-section-title m-0">
          By category
        </h3>
      </div>
      <div className="mt-7 flex items-end justify-between gap-4 border-y border-line py-4">
        <div className="grid gap-1">
          <span className="ui-label">Available each day</span>
          <strong className="ui-number text-xl font-semibold tracking-[-.04em] text-success">
            {formatMoney(dailyPace)} <small className="ui-meta font-normal">/ day</small>
          </strong>
        </div>
        <span className="ui-meta max-w-[22ch] text-right">
          {formatMoney(remainingBudget)} remaining across {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}{' '}
          including today
        </span>
      </div>
      <div className="mt-6 grid gap-6">
        {budgetRows.map((row) => (
          <div className="grid gap-2.5" key={row.id}>
            <div className="flex items-center justify-between gap-3 font-mono text-xs">
              <span className="flex min-w-0 items-center gap-2">
                <CategoryIcon category={row.category} size="md" shape="control" />
                <span className={clsx('truncate', categoryForegroundClass(row.category))}>{row.category}</span>
              </span>
              <div className="grid justify-items-end gap-0.5 text-right">
                <strong className={clsx('ui-number font-normal', row.percent > 100 ? 'text-danger' : 'text-ink')}>
                  {formatMoney(row.spent)} <small className="text-muted">/ {formatMoney(row.amount)}</small>
                </strong>
                <small className={clsx('ui-meta ui-number', categoryForegroundClass(row.category))}>
                  {formatMoney(row.dailyAllowance)} / day
                </small>
              </div>
            </div>
            <Progress
              value={Math.min(row.percent, 100)}
              tone={row.percent > 100 ? 'danger' : 'default'}
              indicatorClassName={row.percent > 100 ? undefined : categoryIndicatorClass(row.category)}
              trackClassName={row.percent > 100 ? undefined : categoryBackgroundClass(row.category)}
              aria-label={`${row.category} monthly budget progress`}
            />
            {row.percent > 100 && (
              <small className="ui-meta text-danger">{formatMoney(row.spent - row.amount)} over</small>
            )}
          </div>
        ))}
      </div>
    </DashboardPanel>
  )
}
