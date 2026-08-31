import { ArrowDown, Check } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { dailyIncome } from '../finance/allocation'
import { entryDate, formatMoney } from '../entries/entry-utils'
import type { Entry } from '../entries/types'
import { DashboardPanel } from './DashboardPanel'

export function SummaryPanels({
  entries,
  accumulation,
  dayKey,
}: {
  entries: Entry[]
  accumulation: number | null
  dayKey: string
}) {
  const allocationEntries = entries.map((entry) => ({ type: entry.type, amount: entry.amount, date: entryDate(entry) }))
  const todayIncome = dailyIncome(allocationEntries, dayKey)
  const todaySpent = entries
    .filter((entry) => entry.type === 'expense' && entryDate(entry) === dayKey)
    .reduce((sum, entry) => sum + entry.amount, 0)
  const availableToday = todayIncome - todaySpent

  return (
    <section
      className="grid grid-cols-1 gap-3.5 animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_80ms_both]"
      aria-label="Money summary">
      <DashboardPanel
        className={clsx(
          '!grid min-h-[250px] grid-cols-[1fr_auto] grid-rows-[auto_1fr] items-center justify-between rounded-[28px] border border-line bg-white px-[43px] py-[35px] text-ink transition-colors duration-300 max-[700px]:min-h-[220px] max-[700px]:p-[26px]',
          availableToday < 0 && 'border-ink',
        )}
        asideClassName="grid justify-items-end gap-[13px]"
        label="available today"
        aside={<span>{availableToday < 0 ? 'over pace' : 'on pace'}</span>}
        ariaLabel="Today's available amount">
        <div className="col-start-1 row-start-2 today-copy">
          <strong className="block text-[clamp(52px,9vw,94px)] font-semibold leading-[.9] tracking-[-.09em]">
            {formatMoney(availableToday)}
          </strong>
          <span className="mt-5 block font-mono text-[11px]">
            {todayIncome
              ? `${formatMoney(todayIncome)} allocated - ${formatMoney(todaySpent)} spent`
              : 'Add income to set your daily pace'}
          </span>
        </div>
        <div className="col-start-2 row-start-2 self-center justify-self-end">
          <div className="grid size-[52px] place-items-center rounded-full border border-line-strong">
            <Check size={24} weight="bold" />
          </div>
        </div>
      </DashboardPanel>
      <DashboardPanel
        className="!grid min-h-[180px] grid-cols-[1fr_auto] grid-rows-[auto_1fr] items-center justify-between rounded-[28px] border border-line bg-white px-[43px] py-[35px] text-ink transition-colors duration-300 max-[700px]:min-h-[190px] max-[700px]:p-[26px]"
        asideClassName="grid justify-items-end gap-3"
        label="accumulated"
        aside={<span>all time</span>}
        ariaLabel="All-time accumulation">
        <div className="col-start-1 row-start-2 accumulation-copy">
          <strong className="block text-[clamp(34px,4vw,54px)] font-semibold leading-[.95] tracking-[-.08em]">
            {accumulation === null ? '—' : formatMoney(accumulation)}
          </strong>
          <span className="mt-5 block font-mono text-[11px]">all income minus all expenses</span>
        </div>
        <div className="col-start-2 row-start-2 self-center justify-self-end text-muted">
          <ArrowDown size={23} weight="bold" />
        </div>
      </DashboardPanel>
    </section>
  )
}
