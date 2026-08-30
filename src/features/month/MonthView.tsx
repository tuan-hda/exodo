import { useMemo } from 'react'
import { clsx } from 'clsx'
import { Button } from '../../components/ui/button'
import { dailyIncome, fromKey, toKey } from '../finance/allocation'
import { entryDate, formatShort, monthDays } from '../entries/entry-utils'
import type { Entry } from '../entries/types'
import type { CategoryBudget } from '../budgets/types'
import { BudgetProgress } from '../budgets/BudgetProgress'

export function MonthView({
  entries,
  viewMonth,
  selectedDay,
  todayKey,
  onMonthChange,
  onSelectDay,
  budgets,
}: {
  entries: Entry[]
  viewMonth: Date
  selectedDay: string
  todayKey: string
  onMonthChange: (delta: number) => void
  onSelectDay: (day: string) => void
  budgets: CategoryBudget[]
}) {
  const allocationEntries = entries.map((entry) => ({ type: entry.type, amount: entry.amount, date: entryDate(entry) }))
  const currentMonthEntries = entries.filter((entry) => {
    const date = fromKey(entryDate(entry))
    return date.getMonth() === viewMonth.getMonth() && date.getFullYear() === viewMonth.getFullYear()
  })
  const monthIncome = Array.from({ length: monthDays(viewMonth) }, (_, i) =>
    dailyIncome(allocationEntries, toKey(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1, 12))),
  ).reduce((sum, value) => sum + value, 0)
  const monthSpent = currentMonthEntries
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0)
  const dailyRows = useMemo(
    () =>
      Array.from({ length: monthDays(viewMonth) }, (_, i) => {
        const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1, 12)
        const key = toKey(date)
        const spent = entries
          .filter((entry) => entry.type === 'expense' && entryDate(entry) === key)
          .reduce((sum, entry) => sum + entry.amount, 0)
        const income = dailyIncome(allocationEntries, key)
        return { date, key, income, spent, left: income - spent }
      }),
    [entries, viewMonth],
  )
  const calendarCells = useMemo(() => {
    const leadingDays = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1, 12).getDay()
    return [...Array.from({ length: leadingDays }, () => null), ...dailyRows]
  }, [dailyRows, viewMonth])
  const visibleDailyRows = useMemo(() => {
    const selectedIndex = dailyRows.findIndex((row) => row.key === selectedDay)
    const maxStart = Math.max(dailyRows.length - 10, 0)
    const start = Math.min(Math.max(selectedIndex - 4, 0), maxStart)
    return dailyRows.slice(start, start + 10)
  }, [dailyRows, selectedDay])

  return (
    <section className="pt-[106px] animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_200ms_both] max-[700px]:pt-[75px]">
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-[15px] font-mono text-[11px] uppercase tracking-[.12em] text-muted">the daily view</p>
          <h2 className="mb-[17px] text-[clamp(30px,4vw,44px)] font-semibold leading-none tracking-[-.07em]">
            {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-[34px] rounded-xl p-0 text-[22px] leading-none text-ink transition hover:text-ink"
            type="button"
            onClick={() => onMonthChange(-1)}
            aria-label="Previous month">
            ‹
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-[34px] rounded-xl p-0 text-[22px] leading-none text-ink transition hover:text-ink"
            type="button"
            onClick={() => onMonthChange(1)}
            aria-label="Next month">
            ›
          </Button>
        </div>
      </div>
      <div
        className="mt-4 mb-4 rounded-[20px] border border-line bg-soft p-3"
        aria-label={`${viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} calendar`}>
        <div className="mb-1 grid grid-cols-7">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span className="text-center font-mono text-[9px] uppercase tracking-[.08em] text-muted" key={day}>
              {day}
            </span>
          ))}
        </div>
        <div className="grid auto-rows-[44px] grid-cols-7 gap-1">
          {calendarCells.map((row, index) =>
            row ? (
              <Button
                variant="ghost"
                size="icon"
                key={row.key}
                type="button"
                className={clsx(
                  'relative grid size-10 justify-self-center place-items-center rounded-xl bg-transparent p-0 font-mono text-[11px] text-muted transition hover:text-ink',
                  row.key === todayKey && 'font-bold text-ink',
                  row.key === selectedDay && 'rounded-full bg-ink text-white hover:text-white',
                )}
                onClick={() => onSelectDay(row.key)}>
                <span>{row.date.getDate()}</span>
                {(row.income || row.spent) > 0 && <i className="absolute bottom-1 size-1 rounded-full bg-current" />}
              </Button>
            ) : (
              <span className="size-10 justify-self-center" key={`blank-${index}`} />
            ),
          )}
        </div>
      </div>
      <div className="flex gap-7 border-b border-line-strong py-3 pb-[27px] font-mono text-[11px] text-muted max-[430px]:gap-[13px] max-[430px]:text-[10px]">
        <span>
          <b className="font-normal text-ink">{formatShort(monthIncome)}</b> allocated
        </span>
        <span>
          <b className="font-normal text-ink">{formatShort(monthSpent)}</b> spent
        </span>
        <span>
          <b className="font-normal text-ink">{currentMonthEntries.length}</b> records
        </span>
      </div>
      <BudgetProgress
        budgets={budgets}
        entries={entries}
        monthStart={`${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, '0')}-`}
      />
      <div className="pt-[5px]">
        {visibleDailyRows.map((row) => (
          <div
            key={row.key}
            className={clsx(
              'grid min-h-[53px] grid-cols-[48px_30px_1fr_110px_64px] items-center gap-3.5 border-b border-line font-mono text-[11px] text-muted max-[700px]:grid-cols-[42px_24px_1fr_75px_52px] max-[700px]:gap-2 max-[430px]:grid-cols-[35px_22px_1fr_64px_44px]',
              row.key === todayKey && 'font-semibold text-ink',
              row.key === selectedDay && 'bg-soft',
            )}>
            <span className="uppercase">{row.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className="text-ink">{row.date.getDate()}</span>
            <span className="h-px bg-line-strong" />
            <span className="text-right max-[700px]:text-[10px] max-[430px]:overflow-hidden max-[430px]:text-ellipsis max-[430px]:whitespace-nowrap">
              {row.income ? `+${formatShort(row.income)}` : 'no allocation'}
            </span>
            <strong className={clsx('text-right font-normal', row.left < 0 ? 'text-danger' : 'text-ink')}>
              {row.income || row.spent ? formatShort(row.left) : '·'}
            </strong>
          </div>
        ))}
      </div>
    </section>
  )
}
