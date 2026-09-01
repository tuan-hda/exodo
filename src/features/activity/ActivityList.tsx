import {
  CalendarDots,
  CaretLeft,
  CaretRight,
  CircleNotch,
  ClockCounterClockwise,
  MagnifyingGlass,
  X,
} from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { fromKey } from '../finance/allocation'
import { categoryClass, categoryIcon } from '../entries/CategoryPicker'
import { entryDate, formatShort } from '../entries/entry-utils'
import type { Entry } from '../entries/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import { Input } from '@/components/ui/input'

type ActivityDay = { key: string; label: string; entries: Entry[] }
type ActivityMonth = { key: string; label: string; entries: Entry[]; income: number; expense: number }

function monthChip(key: string) {
  return fromKey(`${key}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function dateLabel(key: string) {
  return fromKey(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function groupByDate(entries: Entry[]) {
  return entries.reduce<ActivityDay[]>((groups, entry) => {
    const key = entryDate(entry)
    const group = groups.find((item) => item.key === key)
    if (group) group.entries.push(entry)
    else groups.push({ key, label: dateLabel(key), entries: [entry] })
    return groups
  }, [])
}

export function ActivityList({
  entries,
  todayKey,
  deletingEntryId,
  onEdit,
  onRemove,
  onOpenAnalysis,
}: {
  entries: Entry[]
  todayKey: string
  deletingEntryId: string | null
  onEdit: (entry: Entry) => void
  onRemove: (id: string) => void
  onOpenAnalysis: (monthKey: string) => void
}) {
  const [query, setQuery] = useState('')
  const [entryToDelete, setEntryToDelete] = useState<Entry | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(todayKey.slice(0, 7))
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const sortedEntries = [...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  const filteredEntries = normalizedQuery
    ? sortedEntries.filter((entry) =>
        [entry.title, entry.category ?? '', entry.type].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        ),
      )
    : sortedEntries
  const groupedEntries = filteredEntries.reduce<ActivityMonth[]>((groups, entry) => {
    const key = entryDate(entry).slice(0, 7)
    const group = groups.find((item) => item.key === key)
    if (group) {
      group.entries.push(entry)
      if (entry.type === 'income') group.income += entry.amount
      else group.expense += entry.amount
    } else {
      groups.push({
        key,
        label: fromKey(`${key}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        entries: [entry],
        income: entry.type === 'income' ? entry.amount : 0,
        expense: entry.type === 'expense' ? entry.amount : 0,
      })
    }
    return groups
  }, [])
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
    <section className="animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_260ms_both]">
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-[15px] font-mono text-[11px] uppercase tracking-[.12em] text-muted">recent activity</p>
          <h2 className="mb-[17px] text-[clamp(30px,4vw,44px)] font-semibold leading-none tracking-[-.07em]">
            What moved.
          </h2>
        </div>
        <ClockCounterClockwise className="text-muted" size={22} />
      </div>
      {entries.length > 0 && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-[14px] border border-line-strong bg-white px-3 text-muted">
            <MagnifyingGlass size={16} />
            <span className="sr-only">Search activity</span>
            <Input
              className="border-0 bg-transparent px-0 text-base text-ink outline-0 placeholder:text-muted"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Search activity"
            />
          </label>
          <span className="shrink-0 font-mono text-[10px] text-muted">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'record' : 'records'}
          </span>
        </div>
      )}
      {monthKeys.length > 0 && (
        <nav
          className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-y border-line py-2"
          aria-label="Activity months">
          <Button
            variant="ghost"
            className="min-w-0 items-center justify-start gap-1 rounded-xl px-2 py-2 text-left font-mono text-[10px] text-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!previousMonth}
            type="button"
            onClick={() => previousMonth && setSelectedMonth(previousMonth)}
            aria-label={previousMonth ? `Previous month, ${monthChip(previousMonth)}` : 'No previous month'}>
            <CaretLeft size={17} />
            <span>{previousMonth ? monthChip(previousMonth) : '—'}</span>
          </Button>
          <div className="grid justify-items-center gap-0.5 px-3 text-center" aria-current="date">
            <span className="font-mono text-[9px] uppercase tracking-[.1em] text-muted">Viewing</span>
            <strong className="text-sm font-semibold text-ink">{activeMonth ? monthChip(activeMonth) : '—'}</strong>
          </div>
          <Button
            variant="ghost"
            className="min-w-0 items-center justify-end gap-1 rounded-xl px-2 py-2 text-right font-mono text-[10px] text-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!nextMonth}
            type="button"
            onClick={() => nextMonth && setSelectedMonth(nextMonth)}
            aria-label={nextMonth ? `Next month, ${monthChip(nextMonth)}` : 'No next month'}>
            <span>{nextMonth ? monthChip(nextMonth) : '—'}</span>
            <CaretRight size={17} />
          </Button>
        </nav>
      )}
      <div className="mt-[9px] border-t border-line-strong">
        {activeGroup ? (
          <section className="border-b border-line-strong">
            <div className="flex items-center justify-between gap-3 border-b border-line py-3">
              <h3 className="m-0 font-mono text-[10px] font-normal uppercase tracking-[.08em] text-muted">
                {activeGroup.label}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-lg px-2.5 font-mono text-[9px] uppercase tracking-[.06em]"
                type="button"
                onClick={() => onOpenAnalysis(activeGroup.key)}>
                Analysis
              </Button>
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 border-b border-line bg-transparent px-0 py-4 text-left"
              onClick={() => onOpenAnalysis(activeGroup.key)}
              aria-label={`Analyze ${activeGroup.label}`}>
              <span className="grid gap-1">
                <b className="font-mono text-[9px] font-normal uppercase tracking-[.08em] text-muted">Income</b>
                <strong className="font-mono text-xs font-normal text-[#176b3a]">
                  +{formatShort(activeGroup.income)}
                </strong>
              </span>
              <span className="grid justify-items-center gap-1 text-center">
                <b className="font-mono text-[9px] font-normal uppercase tracking-[.08em] text-muted">Expense</b>
                <strong className="font-mono text-xs font-normal text-[#a84528]">
                  -{formatShort(activeGroup.expense)}
                </strong>
              </span>
              <span className="grid justify-items-end gap-1 text-right">
                <b className="font-mono text-[9px] font-normal uppercase tracking-[.08em] text-muted">Leftover</b>
                <strong
                  className={clsx(
                    'font-mono text-xs font-normal',
                    activeGroup.income - activeGroup.expense < 0 ? 'text-[#a84528]' : 'text-ink',
                  )}>
                  {formatShort(activeGroup.income - activeGroup.expense)}
                </strong>
              </span>
            </button>
            {groupByDate(activeGroup.entries).map((day) => (
              <section key={day.key}>
                <h4 className="m-0 border-b border-line bg-soft px-2 py-3 font-mono text-[10px] font-normal uppercase tracking-[.08em] text-muted">
                  {day.label}
                </h4>
                {day.entries.map((entry) => (
                  <div
                    className="grid min-h-[67px] cursor-pointer grid-cols-[34px_1fr_auto_24px] items-center gap-[13px] border-b border-line transition-colors max-[430px]:grid-cols-[30px_1fr_auto_20px] max-[430px]:gap-[9px]"
                    key={entry.id}
                    onClick={() => onEdit(entry)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => event.key === 'Enter' && onEdit(entry)}>
                    <span
                      className={clsx(
                        'grid size-[29px] place-items-center rounded-full border text-current',
                        categoryClass(entry.category ?? 'Other'),
                      )}>
                      {categoryIcon(entry.category ?? 'Other', 16)}
                    </span>
                    <span>
                      <strong className="block text-[13px] font-medium text-ink">
                        {entry.title || entry.category || (entry.type === 'income' ? 'Income' : 'Expense')}
                      </strong>
                      <small className="mt-1 block font-mono text-[10px] text-muted">
                        {entry.category ?? 'Other'} · {entry.occurredAt.slice(11, 16)}
                      </small>
                    </span>
                    <b className={clsx('font-mono text-xs font-normal', entry.type === 'income' && 'text-ink')}>
                      {entry.type === 'income' ? '+' : '-'}
                      {formatShort(entry.amount)}
                    </b>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="bg-transparent p-1 text-muted transition hover:text-danger"
                      disabled={deletingEntryId === entry.id}
                      onClick={(event) => {
                        event.stopPropagation()
                        setEntryToDelete(entry)
                      }}
                      aria-label={`Remove ${entry.title || entry.category || entry.type}`}>
                      {deletingEntryId === entry.id ? (
                        <CircleNotch className="animate-spin" size={15} />
                      ) : (
                        <X size={15} />
                      )}
                    </Button>
                  </div>
                ))}
              </section>
            ))}
            <p className="m-0 border-t border-line px-2 py-4 text-center font-mono text-[10px] uppercase tracking-[.08em] text-muted">
              End of transactions
            </p>
          </section>
        ) : (
          <div className="grid justify-items-center gap-3 px-[45px] py-[45px] text-muted">
            <CalendarDots size={22} />
            <p className="m-0 text-[13px]">
              {entries.length ? 'No matching records found.' : 'Your first record will show up here.'}
            </p>
          </div>
        )}
      </div>
      <AlertDialog open={Boolean(entryToDelete)} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              {entryToDelete
                ? `This will permanently remove ${entryToDelete.title || entryToDelete.category || entryToDelete.type}.`
                : 'This transaction will be permanently removed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (entryToDelete) onRemove(entryToDelete.id)
                setEntryToDelete(null)
              }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
