import { CalendarDots, CircleNotch, ClockCounterClockwise, MagnifyingGlass, X } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { fromKey } from '../allocation'
import { categoryClass, categoryIcon } from './CategoryPicker'
import { entryDate, formatShort } from '../lib/entry-utils'
import type { Entry } from '../types/entry'

type ActivityDay = { key: string; label: string; entries: Entry[] }

export function ActivityList({ entries, deletingEntryId, onEdit, onRemove }: { entries: Entry[]; deletingEntryId: string | null; onEdit: (entry: Entry) => void; onRemove: (id: string) => void }) {
  const daysPerPage = 7
  const [query, setQuery] = useState('')
  const [visibleDayCount, setVisibleDayCount] = useState(daysPerPage)
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
  const visibleGroups = groupedEntries.slice(0, visibleDayCount)
  const hasMore = visibleGroups.length < groupedEntries.length

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return
    const observer = new IntersectionObserver(([observation]) => {
      if (observation.isIntersecting) setVisibleDayCount(current => Math.min(current + daysPerPage, groupedEntries.length))
    }, { rootMargin: '280px 0px' })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [groupedEntries.length, hasMore, visibleDayCount])

  function updateQuery(value: string) {
    setQuery(value)
    setVisibleDayCount(daysPerPage)
  }

  return <section className="activity-section"><div className="section-heading activity-heading"><div><p className="eyebrow">recent activity</p><h2>What moved.</h2></div><ClockCounterClockwise size={22} /></div>{entries.length > 0 && <div className="activity-tools"><label className="activity-search"><MagnifyingGlass size={16} /><span className="sr-only">Search activity</span><input value={query} onChange={event => updateQuery(event.target.value)} placeholder="Search activity" /></label><span className="activity-count">{filteredEntries.length} {filteredEntries.length === 1 ? 'record' : 'records'}</span></div>}<div className="activity-list">{visibleGroups.length ? visibleGroups.map(group => <section className="activity-day" key={group.key}><h3>{group.label}</h3>{group.entries.map(entry => <div className="activity-row" key={entry.id} onClick={() => onEdit(entry)} role="button" tabIndex={0} onKeyDown={event => event.key === 'Enter' && onEdit(entry)}><span className={`activity-icon ${categoryClass(entry.category ?? 'Other')}`}>{categoryIcon(entry.category ?? 'Other', 16)}</span><span className="activity-name"><strong>{entry.title || entry.category || (entry.type === 'income' ? 'Income' : 'Expense')}</strong><small>{entry.category ?? 'Other'} · {entry.occurredAt.slice(11, 16)}</small></span><b className={entry.type === 'income' ? 'income-text' : ''}>{entry.type === 'income' ? '+' : '-'}{formatShort(entry.amount)}</b><button className="remove-entry" disabled={deletingEntryId === entry.id} onClick={event => { event.stopPropagation(); onRemove(entry.id) }} aria-label={`Remove ${entry.title || entry.category || entry.type}`}>{deletingEntryId === entry.id ? <CircleNotch className="loading-spinner" size={15} /> : <X size={15} />}</button></div>)}</section>) : <div className="empty-activity"><CalendarDots size={22} /><p>{entries.length ? 'No matching records found.' : 'Your first record will show up here.'}</p></div>}{hasMore && <div ref={sentinelRef} className="activity-load-more" aria-hidden="true" />}</div></section>
}
