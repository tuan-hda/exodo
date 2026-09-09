import { clsx } from 'clsx'
import { categoryClass, categoryIcon } from '../entries/CategoryPicker'
import { entryDate, formatShort } from '../entries/entry-utils'
import type { Entry } from '../entries/types'
import type { CategoryBudget } from './types'
import { Progress } from '../../components/ui/progress'
import { DashboardPanel } from '../dashboard/DashboardPanel'
import { dailyBudgetAllowance, remainingDaysInMonth } from './budget-utils'

export function BudgetProgress({
  budgets,
  entries,
  monthStart,
  dayKey,
}: {
  budgets: CategoryBudget[]
  entries: Entry[]
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

  if (!budgetRows.length) return null

  return (
    <DashboardPanel
      className="p-7 md:p-9"
      label="monthly limits"
      aside={`${budgetRows.length} set`}
      ariaLabel="Monthly limits">
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
                  {formatShort(row.spent)} <small className="text-muted">/ {formatShort(row.amount)}</small>
                </strong>
                <small className="text-[10px] font-normal text-muted">{formatShort(row.dailyAllowance)} / day</small>
              </div>
            </div>
            <Progress value={Math.min(row.percent, 100)} tone={row.percent > 100 ? 'danger' : 'default'} />
            {row.percent > 100 && (
              <small className="text-[10px] text-danger">{formatShort(row.spent - row.amount)} over</small>
            )}
          </div>
        ))}
      </div>
    </DashboardPanel>
  )
}
