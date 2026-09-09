import { Check } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { dailyIncome } from '@/features/finance/allocation'
import { entryDate } from '@/lib/date'
import type { Entry } from '@/features/entries/types'
import { CountUp } from '@/components/ui/count-up'
import { FadeContent } from '@/components/ui/fade-content'
import { DashboardValuePanel } from './DashboardValuePanel'
import { BudgetProgress } from '@/features/budgets/BudgetProgress'
import type { CategoryBudget } from '@/features/budgets/types'
import { SavingsGoalsPanel } from '@/features/savings/SavingsGoalsPanel'
import { formatMoney } from '@/lib/money'

export function SummaryPanels({
  entries,
  entriesLoading,
  dayKey,
  budgets,
  budgetsLoading,
  userId,
}: {
  entries: Entry[]
  entriesLoading: boolean
  dayKey: string
  budgets: CategoryBudget[]
  budgetsLoading: boolean
  userId?: string
}) {
  const allocationEntries = entries.map((entry) => ({ type: entry.type, amount: entry.amount, date: entryDate(entry) }))
  const todayIncome = dailyIncome(allocationEntries, dayKey)
  const todaySpent = entries
    .filter((entry) => entry.type === 'expense' && entryDate(entry) === dayKey)
    .reduce((sum, entry) => sum + entry.amount, 0)
  const availableToday = todayIncome - todaySpent

  return (
    <section className="ui-page-enter ui-page-enter-delay-80 grid grid-cols-1 gap-4" aria-label="Money summary">
      <FadeContent>
        <DashboardValuePanel
          className={clsx(availableToday < 0 && 'border-danger/40')}
          minHeightClassName="min-h-[240px]"
          label="available today"
          aside={
            <span className={clsx(entriesLoading ? 'text-muted' : availableToday < 0 ? 'text-danger' : 'text-success')}>
              {entriesLoading ? 'loading' : availableToday < 0 ? 'over pace' : 'on pace'}
            </span>
          }
          ariaLabel="Today's available amount"
          ariaBusy={entriesLoading}
          valueLabel="spendable now"
          value={<CountUp value={availableToday} formatValue={formatMoney} />}
          description={
            todayIncome
              ? `${formatMoney(todayIncome)} allocated - ${formatMoney(todaySpent)} spent`
              : 'Add income to set your daily pace'
          }
          iconClassName={availableToday < 0 ? 'border-danger/40 text-danger' : undefined}
          icon={<Check size={24} weight="bold" />}
        />
      </FadeContent>
      <BudgetProgress
        budgets={budgets}
        isLoading={budgetsLoading}
        entries={entries}
        monthStart={`${dayKey.slice(0, 7)}-`}
        dayKey={dayKey}
      />
      <SavingsGoalsPanel userId={userId} entries={entries} />
    </section>
  )
}
