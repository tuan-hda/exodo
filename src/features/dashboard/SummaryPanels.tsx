import { Check } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { dailyIncome } from '../finance/allocation'
import { entryDate, formatMoney } from '../entries/entry-utils'
import type { Entry } from '../entries/types'
import { CountUp } from '@/components/ui/count-up'
import { FadeContent } from '@/components/ui/fade-content'
import { DashboardPanel } from './DashboardPanel'
import { BudgetProgress } from '../budgets/BudgetProgress'
import type { CategoryBudget } from '../budgets/types'
import { SavingsGoalsPanel } from '../savings/SavingsGoalsPanel'
import { Skeleton } from '@/components/ui/skeleton'

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
    <section
      className="grid grid-cols-1 gap-4 animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_80ms_both]"
      aria-label="Money summary">
      <FadeContent>
        <DashboardPanel
          className={clsx(
            'grid min-h-[240px] grid-cols-[1fr_auto] grid-rows-[auto_1fr] items-center justify-between p-7 text-ink md:p-9',
            availableToday < 0 && 'border-danger/40',
          )}
          asideClassName="grid justify-items-end gap-3"
          label="available today"
          aside={
            <span className={clsx(entriesLoading ? 'text-muted' : availableToday < 0 ? 'text-danger' : 'text-success')}>
              {entriesLoading ? 'loading' : availableToday < 0 ? 'over pace' : 'on pace'}
            </span>
          }
          ariaLabel="Today's available amount"
          ariaBusy={entriesLoading}>
          <div className="col-start-1 row-start-2 today-copy">
            <span className="ui-eyebrow block mb-3">spendable now</span>
            {entriesLoading ? (
              <>
                <Skeleton className="h-[clamp(38px,5vw,62px)] w-64 max-w-full" />
                <Skeleton className="mt-5 h-3 w-56 max-w-full" />
              </>
            ) : (
              <>
                <strong className="ui-number block text-[clamp(38px,5vw,62px)] font-sans font-semibold leading-[.9] tracking-[-.09em]">
                  <CountUp value={availableToday} formatValue={formatMoney} />
                </strong>
                <span className="mt-5 block max-w-[38ch] font-mono text-[11px] leading-[1.5] text-muted">
                  {todayIncome
                    ? `${formatMoney(todayIncome)} allocated - ${formatMoney(todaySpent)} spent`
                    : 'Add income to set your daily pace'}
                </span>
              </>
            )}
          </div>
          <div className="col-start-2 row-start-2 self-center justify-self-end">
            <div
              className={clsx(
                'ui-icon-tile size-14 rounded-full bg-surface',
                availableToday < 0 && 'border-danger/40 text-danger',
              )}>
              <Check size={24} weight="bold" />
            </div>
          </div>
        </DashboardPanel>
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
