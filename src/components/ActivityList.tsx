import { CalendarDots, CaretLeft, CaretRight, CircleNotch, ClockCounterClockwise, MagnifyingGlass, X } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { fromKey } from '../allocation'
import { categoryClass, categoryIcon } from './CategoryPicker'
import { entryDate, formatShort } from '../lib/entry-utils'
import type { Entry } from '../types/entry'

type ActivityDay = { key: string; label: string; entries: Entry[] }

function dateChip(key: string) {
  return fromKey(key).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function ActivityList({ entries, todayKey, deletingEntryId, onEdit, onRemove }: { entries: Entry[]; todayKey: string; deletingEntryId: string | null; onEdit: (entry: Entry) => void; onRemove: (id: string) => void }) {
  const transactionsPerPage = 8
  const [query, setQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [visibleTransactionCount, setVisibleTransactionCount] = useState(transactionsPerPage)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const sortedEntries = [...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredEntries = normalizedQuery
    ? sortedEntries.filter(entry => [entry.title, entry.category ?? '', entry.type].some(value => value.toLocaleLowerCase().includes(normalizedQuery)))
    : sortedEntries
  const groupedEntries = filteredEntries.reduce<ActivityDay[]>((groups, entry) => {
    const key = entryDate(entry)
    const group = groups.find(item => item.key === key)
    if (group) group.entries.push(entry)
    else groups.push({ key, label: fromKey(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }), entries: [entry] })
    return groups
  }, [])
  const dateKeys = groupedEntries.map(group => group.key)
  const activeDate = dateKeys.includes(selectedDate) ? selectedDate : dateKeys[0] ?? null
  const activeGroup = groupedEntries.find(group => group.key === activeDate)
  const activeIndex = activeDate ? dateKeys.indexOf(activeDate) : -1
  const previousDate = activeIndex >= 0 ? dateKeys[activeIndex + 1] : undefined
  const nextDate = activeIndex > 0 ? dateKeys[activeIndex - 1] : undefined
  const visibleTransactions = activeGroup?.entries.slice(0, visibleTransactionCount) ?? []
  const hasMore = Boolean(activeGroup && visibleTransactionCount < activeGroup.entries.length)

  useEffect(() => {
    setVisibleTransactionCount(transactionsPerPage)
  }, [activeDate])

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return
    const observer = new IntersectionObserver(([observation]) => {
      if (observation.isIntersecting) setVisibleTransactionCount(current => Math.min(current + transactionsPerPage, activeGroup?.entries.length ?? current))
    }, { rootMargin: '280px 0px' })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [activeDate, activeGroup?.entries.length, hasMore, visibleTransactionCount])

  function selectDate(date: string) {
    setSelectedDate(date)
    setVisibleTransactionCount(transactionsPerPage)
  }

  function updateQuery(value: string) {
    setQuery(value)
    setSelectedDate(todayKey)
    setVisibleTransactionCount(transactionsPerPage)
  }

  return <section className="activity-section"><div className="section-heading activity-heading"><div><p className="eyebrow">recent activity</p><h2>What moved.</h2></div><ClockCounterClockwise size={22} /></div>{entries.length > 0 && <div className="activity-tools"><label className="activity-search"><MagnifyingGlass size={16} /><span className="sr-only">Search activity</span><input value={query} onChange={event => updateQuery(event.target.value)} placeholder="Search activity" /></label><span className="activity-count">{filteredEntries.length} {filteredEntries.length === 1 ? 'record' : 'records'}</span></div>}{dateKeys.length > 0 && <nav className="activity-date-nav" aria-label="Activity dates"><button className="activity-date-option" disabled={!previousDate} type="button" onClick={() => previousDate && selectDate(previousDate)} aria-label={previousDate ? `Previous date, ${dateChip(previousDate)}` : 'No previous date'}><CaretLeft size={17} /><span>{previousDate ? dateChip(previousDate) : '—'}</span></button><div className="activity-date-current" aria-current="date"><span>Viewing</span><strong>{activeDate ? dateChip(activeDate) : '—'}</strong></div><button className="activity-date-option next" disabled={!nextDate} type="button" onClick={() => nextDate && selectDate(nextDate)} aria-label={nextDate ? `Next date, ${dateChip(nextDate)}` : 'No next date'}><span>{nextDate ? dateChip(nextDate) : '—'}</span><CaretRight size={17} /></button></nav>}<div className="activity-list">{activeGroup ? <section className="activity-day"><h3>{activeGroup.label}</h3>{visibleTransactions.map(entry => <div className="activity-row" key={entry.id} onClick={() => onEdit(entry)} role="button" tabIndex={0} onKeyDown={event => event.key === 'Enter' && onEdit(entry)}><span className={`activity-icon ${categoryClass(entry.category ?? 'Other')}`}>{categoryIcon(entry.category ?? 'Other', 16)}</span><span className="activity-name"><strong>{entry.title || entry.category || (entry.type === 'income' ? 'Income' : 'Expense')}</strong><small>{entry.category ?? 'Other'} · {entry.occurredAt.slice(11, 16)}</small></span><b className={entry.type === 'income' ? 'income-text' : ''}>{entry.type === 'income' ? '+' : '-'}{formatShort(entry.amount)}</b><button className="remove-entry" disabled={deletingEntryId === entry.id} onClick={event => { event.stopPropagation(); onRemove(entry.id) }} aria-label={`Remove ${entry.title || entry.category || entry.type}`}>{deletingEntryId === entry.id ? <CircleNotch className="loading-spinner" size={15} /> : <X size={15} />}</button></div>)}{hasMore ? <div ref={sentinelRef} className="activity-load-more" aria-hidden="true" /> : <p className="activity-end">End of transactions</p>}</section> : <div className="empty-activity"><CalendarDots size={22} /><p>{entries.length ? 'No matching records found.' : 'Your first record will show up here.'}</p></div>}</div></section>
}
