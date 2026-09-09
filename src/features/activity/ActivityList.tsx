import { CalendarDots, CaretLeft, CaretRight, ClockCounterClockwise, MagnifyingGlass } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryIcon } from '@/features/finance/CategoryIcon'
import type { Entry } from '@/features/entries/types'
import { Input } from '@/components/ui/input'
import { filterActivityEntries, formatActivityMonth, groupActivityByDate, groupActivityByMonth } from './activity-utils'
import { formatMoney } from '@/lib/money'
import { formatEntryTime } from '@/lib/date-format'

export function ActivityList({
  entries,
  isLoading = false,
  todayKey,
  onEdit,
  onOpenAnalysis,
}: {
  entries: Entry[]
  isLoading?: boolean
  todayKey: string
  onEdit: (entry: Entry) => void
  onOpenAnalysis: (monthKey: string) => void
}) {
  const [query, setQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(todayKey.slice(0, 7))
  useEffect(() => {
    setSelectedMonth(todayKey.slice(0, 7))
  }, [todayKey])
  const filteredEntries = filterActivityEntries(entries, query)
  const groupedEntries = groupActivityByMonth(filteredEntries)
  const monthKeys = groupedEntries.map((group) => group.key)
  const activeMonth = monthKeys.includes(selectedMonth) ? selectedMonth : (monthKeys[0] ?? null)
  const activeGroup = groupedEntries.find((group) => group.key === activeMonth)
  const activeIndex = activeMonth ? monthKeys.indexOf(activeMonth) : -1
  const previousMonth = activeIndex >= 0 ? monthKeys[activeIndex + 1] : undefined
  const nextMonth = activeIndex > 0 ? monthKeys[activeIndex - 1] : undefined

  function updateQuery(value: string) {
    setQuery(value)
    setSelectedMonth(todayKey.slice(0, 7))
  }

  return (
    <section className="ui-page-enter ui-page-enter-delay-260" aria-busy={isLoading}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="ui-eyebrow mb-3">recent activity</p>
          <h2 className="ui-section-title m-0">What moved.</h2>
        </div>
        <span className="ui-icon-tile size-10 rounded-full" aria-hidden="true">
          <ClockCounterClockwise className="text-muted" size={19} />
        </span>
      </div>
      {entries.length > 0 && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <label className="relative block min-w-0 flex-1">
            <MagnifyingGlass
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
              size={16}
            />
            <span className="sr-only">Search activity</span>
            <Input
              className="pl-10"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Search activity"
            />
          </label>
          <span className="ui-meta shrink-0">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'record' : 'records'}
          </span>
        </div>
      )}
      {monthKeys.length > 0 && (
        <nav
          className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-y border-line py-2"
          aria-label="Activity months">
          <Button
            variant="subtle-nav"
            size="meta"
            className="justify-start text-left"
            disabled={!previousMonth}
            type="button"
            onClick={() => previousMonth && setSelectedMonth(previousMonth)}
            aria-label={previousMonth ? `Previous month, ${formatActivityMonth(previousMonth)}` : 'No previous month'}>
            <CaretLeft size={17} />
            <span>{previousMonth ? formatActivityMonth(previousMonth) : '—'}</span>
          </Button>
          <div className="grid justify-items-center gap-0.5 px-3 text-center">
            <span className="ui-label tracking-[.1em]">Viewing</span>
            <strong className="text-sm font-semibold text-ink">
              {activeMonth ? formatActivityMonth(activeMonth) : '—'}
            </strong>
          </div>
          <Button
            variant="subtle-nav"
            size="meta"
            className="justify-end text-right"
            disabled={!nextMonth}
            type="button"
            onClick={() => nextMonth && setSelectedMonth(nextMonth)}
            aria-label={nextMonth ? `Next month, ${formatActivityMonth(nextMonth)}` : 'No next month'}>
            <span>{nextMonth ? formatActivityMonth(nextMonth) : '—'}</span>
            <CaretRight size={17} />
          </Button>
        </nav>
      )}
      <div className="mt-[9px] border-t border-line-strong">
        {activeGroup ? (
          <section className="border-b border-line-strong">
            <div className="flex items-center justify-between gap-3 border-b border-line py-3">
              <h3 className="ui-eyebrow m-0">{activeGroup.label}</h3>
              <Button
                variant="outline"
                size="sm"
                className="ui-meta"
                type="button"
                onClick={() => onOpenAnalysis(activeGroup.key)}>
                Analysis
              </Button>
            </div>
            <Button
              variant="list"
              size="summary"
              type="button"
              onClick={() => onOpenAnalysis(activeGroup.key)}
              aria-label={`Analyze ${activeGroup.label}`}>
              <span className="grid gap-1">
                <b className="ui-label">Income</b>
                <strong className="ui-number text-xs font-normal text-success">
                  +{formatMoney(activeGroup.income)}
                </strong>
              </span>
              <span className="grid justify-items-center gap-1 text-center">
                <b className="ui-label">Expense</b>
                <strong className="ui-number text-xs font-normal text-danger">
                  -{formatMoney(activeGroup.expense)}
                </strong>
              </span>
              <span className="grid justify-items-end gap-1 text-right">
                <b className="ui-label">Leftover</b>
                <strong
                  className={clsx(
                    'ui-number text-xs font-normal',
                    activeGroup.income - activeGroup.expense < 0 ? 'text-danger' : 'text-ink',
                  )}>
                  {formatMoney(activeGroup.income - activeGroup.expense)}
                </strong>
              </span>
            </Button>
            {groupActivityByDate(activeGroup.entries).map((day) => (
              <section key={day.key}>
                <h4 className="ui-label m-0 border-b border-line px-2 py-3">{day.label}</h4>
                {day.entries.map((entry) => (
                  <Button variant="list" size="list" key={entry.id} onClick={() => onEdit(entry)} type="button">
                    <CategoryIcon category={entry.category ?? 'Other'} size="xs" />
                    <span className="min-w-0">
                      <strong className="block truncate text-[13px] font-medium text-ink">
                        {entry.title || entry.category || (entry.type === 'income' ? 'Income' : 'Expense')}
                      </strong>
                      <small className="ui-meta mt-1 block">
                        {entry.category ?? 'Other'} · {formatEntryTime(entry.occurredAt)}
                      </small>
                    </span>
                    <b
                      className={clsx(
                        'ui-number text-base font-semibold',
                        entry.type === 'expense' ? 'text-danger' : 'text-success',
                      )}>
                      {entry.type === 'income' ? '+' : '-'}
                      {formatMoney(entry.amount)}
                    </b>
                  </Button>
                ))}
              </section>
            ))}
            <p className="ui-label m-0 border-t border-line px-2 py-4 text-center">End of transactions</p>
          </section>
        ) : isLoading ? (
          <div className="mt-4 grid gap-3" role="status" aria-label="Loading activity">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="flex min-h-[67px] items-center gap-3 border-b border-line" key={index}>
                <Skeleton className="size-8 rounded-full" />
                <div className="grid flex-1 gap-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-4"
            icon={<CalendarDots size={21} />}
            title={entries.length ? 'No matching records found' : 'No activity yet'}
            description={
              entries.length
                ? 'Try a different search or choose another month.'
                : 'Your first record will show up here.'
            }
          />
        )}
      </div>
    </section>
  )
}
