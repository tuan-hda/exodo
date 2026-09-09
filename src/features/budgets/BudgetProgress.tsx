import { clsx } from 'clsx'
import { CategoryIcon } from '@/features/finance/CategoryIcon'
import { entryDate } from '@/lib/date'
import type { Entry } from '@/features/entries/types'
import type { CategoryBudget } from './types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardPanel } from '@/features/dashboard/DashboardPanel'
import { dailyBudgetAllowance, remainingDaysInMonth } from './budget-utils'
import { formatMoney } from '@/lib/money'

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
  const dailyPace = Math.floor(budgetRows.reduce((sum, row) => sum + row.dailyAllowance, 0))

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
        <Button asChild variant="outline-muted" size="sm" className="justify-self-start">
          <a href="/?tab=settings&section=budgets">Set a category limit</a>
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
      ariaLabel="Monthly limits"
      ariaBusy={isLoading}>
      <div className="flex items-end justify-between gap-4">
        <h3 id="budget-progress-title" className="ui-section-title m-0">
          By category
        </h3>
      </div>
      <div className="mt-7 flex items-end justify-between gap-4 border-y border-line py-4">
        <div className="grid gap-1">
          <span className="ui-label">Daily pace</span>
          <strong className="ui-number text-xl font-semibold tracking-[-.04em]">
            {formatMoney(Math.floor(dailyPace))} <small className="ui-meta font-normal">/ day</small>
          </strong>
        </div>
        <span className="ui-meta max-w-[16ch] text-right">
          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} including today
        </span>
      </div>
      <div className="mt-6 grid gap-6">
        {budgetRows.map((row) => (
          <div className="grid gap-2.5" key={row.id}>
            <div className="flex items-center justify-between gap-3 font-mono text-xs">
              <span className="flex min-w-0 items-center gap-2">
                <CategoryIcon category={row.category} size="md" shape="control" />
                <span className="truncate">{row.category}</span>
              </span>
              <div className="grid justify-items-end gap-0.5 text-right">
                <strong className={clsx('ui-number font-normal', row.percent > 100 ? 'text-danger' : 'text-ink')}>
                  {formatMoney(row.spent)} <small className="text-muted">/ {formatMoney(row.amount)}</small>
                </strong>
                <small className="ui-meta ui-number">{formatMoney(Math.floor(row.dailyAllowance))} / day</small>
              </div>
            </div>
            <Progress
              value={Math.min(row.percent, 100)}
              tone={row.percent > 100 ? 'danger' : 'default'}
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
