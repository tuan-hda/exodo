import { ArrowDown, ArrowUp, CalendarDots, CaretLeft, CaretRight, CircleNotch, ClockCounterClockwise, MagnifyingGlass, X } from '@phosphor-icons/react'
import { useState } from 'react'
import { fromKey } from '../allocation'
import { entryDate, formatShort } from '../lib/entry-utils'
import type { Entry } from '../types/entry'

export function ActivityList({ entries, deletingEntryId, onEdit, onRemove }: { entries: Entry[]; deletingEntryId: string | null; onEdit: (entry: Entry) => void; onRemove: (id: string) => void }) {
  const pageSize = 8
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const sortedEntries = [...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredEntries = normalizedQuery
    ? sortedEntries.filter(entry => [entry.title, entry.category ?? '', entry.type].some(value => value.toLocaleLowerCase().includes(normalizedQuery)))
    : sortedEntries
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visibleEntries = filteredEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function updateQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  return <section className="activity-section"><div className="section-heading activity-heading"><div><p className="eyebrow">recent activity</p><h2>What moved.</h2></div><ClockCounterClockwise size={22} /></div>{entries.length > 0 && <div className="activity-tools"><label className="activity-search"><MagnifyingGlass size={16} /><span className="sr-only">Search activity</span><input value={query} onChange={event => updateQuery(event.target.value)} placeholder="Search activity" /></label><span className="activity-count">{filteredEntries.length} {filteredEntries.length === 1 ? 'record' : 'records'}</span></div>}<div className="activity-list">{visibleEntries.length ? visibleEntries.map(entry => <div className="activity-row" key={entry.id} onClick={() => onEdit(entry)} role="button" tabIndex={0} onKeyDown={event => event.key === 'Enter' && onEdit(entry)}><span className={`activity-icon ${entry.type}`}>{entry.type === 'income' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}</span><span className="activity-name"><strong>{entry.title || entry.category || (entry.type === 'income' ? 'Income' : 'Expense')}</strong><small>{entry.category ?? 'Other'} · {fromKey(entryDate(entry)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {entry.occurredAt.slice(11, 16)}</small></span><b className={entry.type === 'income' ? 'income-text' : ''}>{entry.type === 'income' ? '+' : '-'}{formatShort(entry.amount)}</b><button className="remove-entry" disabled={deletingEntryId === entry.id} onClick={event => { event.stopPropagation(); onRemove(entry.id) }} aria-label={`Remove ${entry.title || entry.category || entry.type}`}>{deletingEntryId === entry.id ? <CircleNotch className="loading-spinner" size={15} /> : <X size={15} />}</button></div>) : <div className="empty-activity"><CalendarDots size={22} /><p>{entries.length ? 'No matching records found.' : 'Your first record will show up here.'}</p></div>}</div>{totalPages > 1 && <nav className="activity-pagination" aria-label="Activity pages"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page"><CaretLeft size={16} /></button><span>Page {currentPage} of {totalPages}</span><button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next page"><CaretRight size={16} /></button></nav>}</section>
}
