import {
  CalendarDots,
  CaretLeft,
  CaretRight,
  CircleNotch,
  ClockCounterClockwise,
  MagnifyingGlass,
  X,
} from '@phosphor-icons/react'
import { useState } from 'react'
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
}: {
  entries: Entry[]
  todayKey: string
  deletingEntryId: string | null
  onEdit: (entry: Entry) => void
  onRemove: (id: string) => void
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
    <section className="activity-section">
      <div className="section-heading activity-heading">
        <div>
          <p className="eyebrow">recent activity</p>
          <h2>What moved.</h2>
        </div>
        <ClockCounterClockwise size={22} />
      </div>
      {entries.length > 0 && (
        <div className="activity-tools">
          <label className="activity-search">
            <MagnifyingGlass size={16} />
            <span className="sr-only">Search activity</span>
            <input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Search activity" />
          </label>
          <span className="activity-count">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'record' : 'records'}
          </span>
        </div>
      )}
      {monthKeys.length > 0 && (
        <nav className="activity-date-nav" aria-label="Activity months">
          <button
            className="activity-date-option"
            disabled={!previousMonth}
            type="button"
            onClick={() => previousMonth && setSelectedMonth(previousMonth)}
            aria-label={previousMonth ? `Previous month, ${monthChip(previousMonth)}` : 'No previous month'}>
            <CaretLeft size={17} />
            <span>{previousMonth ? monthChip(previousMonth) : '—'}</span>
          </button>
          <div className="activity-date-current" aria-current="date">
            <span>Viewing</span>
            <strong>{activeMonth ? monthChip(activeMonth) : '—'}</strong>
          </div>
          <button
            className="activity-date-option next"
            disabled={!nextMonth}
            type="button"
            onClick={() => nextMonth && setSelectedMonth(nextMonth)}
            aria-label={nextMonth ? `Next month, ${monthChip(nextMonth)}` : 'No next month'}>
            <span>{nextMonth ? monthChip(nextMonth) : '—'}</span>
            <CaretRight size={17} />
          </button>
        </nav>
      )}
      <div className="activity-list">
        {activeGroup ? (
          <section className="activity-day">
            <h3>{activeGroup.label}</h3>
            <div className="activity-month-summary" aria-label={`${activeGroup.label} totals`}>
              <span>
                <b>Income</b>
                <strong className="income">+{formatShort(activeGroup.income)}</strong>
              </span>
              <span>
                <b>Expense</b>
                <strong className="expense">-{formatShort(activeGroup.expense)}</strong>
              </span>
              <span>
                <b>Leftover</b>
                <strong className={`leftover ${activeGroup.income - activeGroup.expense < 0 ? 'negative' : ''}`}>
                  {formatShort(activeGroup.income - activeGroup.expense)}
                </strong>
              </span>
            </div>
            {groupByDate(activeGroup.entries).map((day) => (
              <section className="activity-date-group" key={day.key}>
                <h4>{day.label}</h4>
                {day.entries.map((entry) => (
                  <div
                    className="activity-row"
                    key={entry.id}
                    onClick={() => onEdit(entry)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => event.key === 'Enter' && onEdit(entry)}>
                    <span className={`activity-icon ${categoryClass(entry.category ?? 'Other')}`}>
                      {categoryIcon(entry.category ?? 'Other', 16)}
                    </span>
                    <span className="activity-name">
                      <strong>
                        {entry.title || entry.category || (entry.type === 'income' ? 'Income' : 'Expense')}
                      </strong>
                      <small>
                        {entry.category ?? 'Other'} · {entry.occurredAt.slice(11, 16)}
                      </small>
                    </span>
                    <b className={entry.type === 'income' ? 'income-text' : ''}>
                      {entry.type === 'income' ? '+' : '-'}
                      {formatShort(entry.amount)}
                    </b>
                    <button
                      className="remove-entry"
                      disabled={deletingEntryId === entry.id}
                      onClick={(event) => {
                        event.stopPropagation()
                        setEntryToDelete(entry)
                      }}
                      aria-label={`Remove ${entry.title || entry.category || entry.type}`}>
                      {deletingEntryId === entry.id ? (
                        <CircleNotch className="loading-spinner" size={15} />
                      ) : (
                        <X size={15} />
                      )}
                    </button>
                  </div>
                ))}
              </section>
            ))}
            <p className="activity-end">End of transactions</p>
          </section>
        ) : (
          <div className="empty-activity">
            <CalendarDots size={22} />
            <p>{entries.length ? 'No matching records found.' : 'Your first record will show up here.'}</p>
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
