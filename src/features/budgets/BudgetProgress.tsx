import { clsx } from 'clsx'
import { categoryClass, categoryIcon } from '../entries/CategoryPicker'
import { entryDate, formatShort } from '../entries/entry-utils'
import type { Entry } from '../entries/types'
import type { CategoryBudget } from './types'
import { Progress } from '../../components/ui/progress'
import { DashboardPanel } from '../dashboard/DashboardPanel'

export function BudgetProgress({
  budgets,
  entries,
  monthStart,
}: {
  budgets: CategoryBudget[]
  entries: Entry[]
  monthStart: string
}) {
  const budgetRows = budgets.map((budget) => {
    const spent = entries
      .filter(
        (entry) =>
          entry.type === 'expense' && entry.category === budget.category && entryDate(entry).startsWith(monthStart),
      )
      .reduce((sum, entry) => sum + entry.amount, 0)
    return { ...budget, spent, percent: budget.amount ? (spent / budget.amount) * 100 : 0 }
  })

  if (!budgetRows.length) return null

  return (
    <DashboardPanel
      className="mt-6 min-h-[180px] rounded-[28px] border-line-strong bg-white px-[43px] py-[35px] max-[700px]:p-[26px]"
      label="monthly limits"
      aside={`${budgetRows.length} set`}
      ariaLabel="Monthly limits">
      <div className="flex items-end justify-between gap-4">
        <h3
          id="budget-progress-title"
          className="m-0 text-[clamp(28px,4vw,40px)] font-semibold leading-none tracking-[-.07em]">
          By category
        </h3>
      </div>
      <div className="mt-5 grid gap-5">
        {budgetRows.map((row) => (
          <div className="grid gap-2" key={row.id}>
            <div className="flex items-center justify-between gap-3 font-mono text-xs">
              <span className="flex items-center gap-2">
                <span
                  className={clsx(
                    'grid size-7 shrink-0 place-items-center rounded-full border text-current',
                    categoryClass(row.category),
                  )}>
                  {categoryIcon(row.category, 15)}
                </span>
                {row.category}
              </span>
              <strong className={clsx('font-normal', row.percent > 100 ? 'text-[#a84528]' : 'text-ink')}>
                {formatShort(row.spent)} <small className="text-muted">/ {formatShort(row.amount)}</small>
              </strong>
            </div>
            <Progress
              value={Math.min(row.percent, 100)}
              className={clsx(row.percent > 100 && '[&_[data-slot=progress-indicator]]:bg-[#a84528]')}
            />
            {row.percent > 100 && (
              <small className="text-[10px] text-[#a84528]">{formatShort(row.spent - row.amount)} over</small>
            )}
          </div>
        ))}
      </div>
    </DashboardPanel>
  )
}
