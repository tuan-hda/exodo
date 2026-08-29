import { categoryClass, categoryIcon } from '../entries/CategoryPicker'
import { entryDate, formatShort } from '../entries/entry-utils'
import type { Entry } from '../entries/types'
import type { CategoryBudget } from './types'
import { Progress } from '../../components/ui/progress'

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
    <section className="budget-progress" aria-labelledby="budget-progress-title">
      <div className="budget-progress-heading">
        <div>
          <p className="eyebrow">monthly limits</p>
          <h3 id="budget-progress-title">By category</h3>
        </div>
        <span>{budgetRows.length} set</span>
      </div>
      <div className="budget-progress-list">
        {budgetRows.map((row) => (
          <div className="budget-progress-row" key={row.id}>
            <div className="budget-progress-label">
              <span>
                <span className={`activity-icon ${categoryClass(row.category)}`}>{categoryIcon(row.category, 15)}</span>
                {row.category}
              </span>
              <strong className={row.percent > 100 ? 'over' : ''}>
                {formatShort(row.spent)} <small>/ {formatShort(row.amount)}</small>
              </strong>
            </div>
            <Progress
              value={Math.min(row.percent, 100)}
              className={row.percent > 100 ? 'budget-progress-bar over' : 'budget-progress-bar'}
            />
            {row.percent > 100 && <small className="budget-overage">{formatShort(row.spent - row.amount)} over</small>}
          </div>
        ))}
      </div>
    </section>
  )
}
