'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { allocateIncome, dailyIncome, fromKey, toKey } from './allocation'
import { AuthAccount } from './components/AuthGate'
import { CategoryPicker, type Category, categoryIcon } from './components/CategoryPicker'
import {
  ArrowDown,
  ArrowUp,
  CalendarDots,
  Check,
  ClockCounterClockwise,
  Plus,
  X,
} from '@phosphor-icons/react'

type EntryType = 'income' | 'expense'

type Entry = {
  id: string
  type: EntryType
  amount: number
  date: string
  time?: string
  title: string
  category?: Category
}

const today = new Date()
const todayKey = toKey(today)
const currentTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const whole = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

function formatMoney(value: number) {
  return money.format(Math.round(value))
}

function formatShort(value: number) {
  return `${whole.format(Math.round(value))} ₫`
}

function formatInputAmount(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('en-US') : ''
}

function monthDays(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

function readEntries(storageKey: string): Entry[] {
  try {
    const saved = localStorage.getItem(storageKey) ?? localStorage.getItem('exodo.entries')
    if (saved) return JSON.parse(saved)
  } catch { /* Use the empty state when storage is unavailable. */ }
  return []
}

function App() {
  const { user } = useUser()
  const storageKey = `exodo.entries.${user?.id ?? 'local'}`
  const [entries, setEntries] = useState<Entry[]>([])
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerType, setComposerType] = useState<EntryType>('expense')
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>()
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1, 12))
  const [selectedDay, setSelectedDay] = useState(todayKey)

  useEffect(() => {
    setEntries(readEntries(storageKey))
    setLoadedStorageKey(storageKey)
  }, [storageKey])

  useEffect(() => {
    if (loadedStorageKey !== storageKey) return
    localStorage.setItem(storageKey, JSON.stringify(entries))
  }, [entries, loadedStorageKey, storageKey])

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      const isEditing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)

      if (event.key === 'Escape' && composerOpen) {
        setComposerOpen(false)
        return
      }
      if (isEditing || composerOpen) return

      if (event.key.toLowerCase() === 'i') {
        event.preventDefault()
        openComposer('income')
      }
      if (event.key.toLowerCase() === 'e' || event.key.toLowerCase() === 'n') {
        event.preventDefault()
        openComposer('expense')
      }
      if (event.key === 'ArrowLeft') moveMonth(-1)
      if (event.key === 'ArrowRight') moveMonth(1)
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [composerOpen])

  const todayIncome = dailyIncome(entries, todayKey)
  const todaySpent = entries.filter(entry => entry.type === 'expense' && entry.date === todayKey).reduce((sum, entry) => sum + entry.amount, 0)
  const availableToday = todayIncome - todaySpent
  const currentMonthEntries = entries.filter(entry => {
    const date = fromKey(entry.date)
    return date.getMonth() === viewMonth.getMonth() && date.getFullYear() === viewMonth.getFullYear()
  })
  const monthIncome = Array.from({ length: monthDays(viewMonth) }, (_, i) => dailyIncome(entries, toKey(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1, 12)))).reduce((sum, value) => sum + value, 0)
  const monthSpent = currentMonthEntries.filter(entry => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0)
  const dailyRows = useMemo(() => Array.from({ length: monthDays(viewMonth) }, (_, i) => {
    const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1, 12)
    const key = toKey(date)
    const income = dailyIncome(entries, key)
    const spent = entries.filter(entry => entry.type === 'expense' && entry.date === key).reduce((sum, entry) => sum + entry.amount, 0)
    return { date, key, income, spent, left: income - spent }
  }), [entries, viewMonth])
  const calendarCells = useMemo(() => {
    const leadingDays = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1, 12).getDay()
    return [...Array.from({ length: leadingDays }, () => null), ...dailyRows]
  }, [dailyRows, viewMonth])
  const visibleDailyRows = useMemo(() => {
    const selectedIndex = dailyRows.findIndex(row => row.key === selectedDay)
    const maxStart = Math.max(dailyRows.length - 10, 0)
    const start = Math.min(Math.max(selectedIndex - 4, 0), maxStart)
    return dailyRows.slice(start, start + 10)
  }, [dailyRows, selectedDay])
  const recentEntries = [...entries].sort((a, b) => `${b.date}T${b.time ?? '00:00'}`.localeCompare(`${a.date}T${a.time ?? '00:00'}`)).slice(0, 5)

  function saveEntry(entry: Entry) {
    setEntries(current => editingEntry
      ? current.map(item => item.id === entry.id ? entry : item)
      : [entry, ...current])
    setComposerOpen(false)
    setEditingEntry(undefined)
  }

  function removeEntry(id: string) {
    setEntries(current => current.filter(entry => entry.id !== id))
  }

  function openComposer(type: EntryType, entry?: Entry) {
    setComposerType(type)
    setEditingEntry(entry)
    setComposerOpen(true)
  }

  function moveMonth(delta: number) {
    setViewMonth(current => {
      const next = new Date(current.getFullYear(), current.getMonth() + delta, 1, 12)
      setSelectedDay(toKey(next))
      return next
    })
  }

  if (loadedStorageKey !== storageKey) return <div className="app-shell" aria-busy="true" />

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Exodo home"><span className="wordmark-mark">e</span><span>exodo</span></a>
        <p className="topbar-note">personal money, in motion</p>
        <div className="topbar-actions"><AuthAccount /><button className="topbar-add" onClick={() => openComposer('expense')}><Plus size={16} weight="bold" /> Record</button></div>
      </header>

      <main id="top" className="page">
        <section className="intro">
          <div>
            <p className="eyebrow">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1>Spend what today<br /><em>makes possible.</em></h1>
          </div>
          <p className="intro-copy">Income becomes a daily allowance. Each expense makes the rest of today visible.</p>
        </section>

        <section className={`today-panel ${availableToday < 0 ? 'is-over' : ''}`} aria-label="Today's available amount">
          <div className="today-copy"><span className="today-label">available today</span><strong>{formatMoney(availableToday)}</strong><span className="today-detail">{todayIncome ? `${formatMoney(todayIncome)} allocated - ${formatMoney(todaySpent)} spent` : 'Add income to set your daily pace'}</span></div>
          <div className="today-mark"><span>{availableToday < 0 ? 'over pace' : 'on pace'}</span><div className="mark-circle"><Check size={24} weight="bold" /></div></div>
        </section>

        <section className="capture-grid">
          <div className="section-heading"><p className="eyebrow">make a note</p><h2>Keep the record<br />light.</h2><p>Two entries are enough to start: what came in, and what went out.</p></div>
          <div className="capture-actions"><button className="capture-button income" onClick={() => openComposer('income')}><span className="capture-icon"><ArrowDown size={20} weight="bold" /></span><span><strong>Add income</strong><small>Spread it across its month</small></span><kbd>I</kbd><ArrowUp className="capture-arrow" size={18} /></button><button className="capture-button expense" onClick={() => openComposer('expense')}><span className="capture-icon"><ArrowUp size={20} weight="bold" /></span><span><strong>Add expense</strong><small>Subtract it from today</small></span><kbd>N</kbd><ArrowUp className="capture-arrow" size={18} /></button><div className="shortcut-hint"><span>Shortcuts</span><kbd>←</kbd><kbd>→</kbd><span>month</span><kbd>Esc</kbd><span>close</span></div></div>
        </section>

        <section className="month-section">
          <div className="section-heading month-heading"><div><p className="eyebrow">the daily view</p><h2>{viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2></div><div className="month-controls"><button onClick={() => moveMonth(-1)} aria-label="Previous month">‹</button><button onClick={() => moveMonth(1)} aria-label="Next month">›</button></div></div>
          <div className="month-calendar" aria-label={`${viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} calendar`}><div className="calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{calendarCells.map((row, index) => row ? <button key={row.key} type="button" className={`calendar-day ${row.key === selectedDay ? 'selected' : ''} ${row.key === todayKey ? 'today' : ''}`} onClick={() => setSelectedDay(row.key)}><span>{row.date.getDate()}</span>{(row.income || row.spent) > 0 && <i />}</button> : <span className="calendar-blank" key={`blank-${index}`} />)}</div></div>
          <div className="month-summary"><span><b>{formatShort(monthIncome)}</b> allocated</span><span><b>{formatShort(monthSpent)}</b> spent</span><span><b>{currentMonthEntries.length}</b> records</span></div>
          <div className="day-list">{visibleDailyRows.map(row => <div key={row.key} className={`day-row ${row.key === todayKey ? 'today' : ''} ${row.key === selectedDay ? 'selected' : ''}`}><span className="day-name">{row.date.toLocaleDateString('en-US', { weekday: 'short' })}</span><span className="day-number">{row.date.getDate()}</span><span className="day-line" /><span className="day-allocation">{row.income ? `+${formatShort(row.income)}` : 'no allocation'}</span><strong className={row.left < 0 ? 'negative' : ''}>{row.income || row.spent ? formatShort(row.left) : '·'}</strong></div>)}</div>
        </section>

        <section className="activity-section"><div className="section-heading activity-heading"><div><p className="eyebrow">recent activity</p><h2>What moved.</h2></div><ClockCounterClockwise size={22} /></div><div className="activity-list">{recentEntries.length ? recentEntries.map(entry => <div className="activity-row" key={entry.id} onClick={() => openComposer(entry.type, entry)} role="button" tabIndex={0} onKeyDown={event => event.key === 'Enter' && openComposer(entry.type, entry)}><span className={`activity-icon ${entry.type}`}>{entry.type === 'income' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}</span><span className="activity-name"><strong>{entry.title || entry.category || (entry.type === 'income' ? 'Income' : 'Expense')}</strong><small>{entry.category ?? 'Other'} · {fromKey(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {entry.time ?? '—'}</small></span><b className={entry.type === 'income' ? 'income-text' : ''}>{entry.type === 'income' ? '+' : '-'}{formatShort(entry.amount)}</b><button className="remove-entry" onClick={event => { event.stopPropagation(); removeEntry(entry.id) }} aria-label={`Remove ${entry.title || entry.category || entry.type}`}><X size={15} /></button></div>) : <div className="empty-activity"><CalendarDots size={22} /><p>Your first record will show up here.</p></div>}</div></section>
      </main>

      <footer className="footer"><span>exodo / έξοδο</span><span>money is a daily practice</span></footer>
      {composerOpen && <EntryComposer key={editingEntry?.id ?? composerType} entry={editingEntry} type={composerType} onClose={() => { setComposerOpen(false); setEditingEntry(undefined) }} onSave={saveEntry} />}
    </div>
  )
}

function EntryComposer({ entry, type, onClose, onSave }: { entry?: Entry; type: EntryType; onClose: () => void; onSave: (entry: Entry) => void }) {
  const [amount, setAmount] = useState(entry ? formatInputAmount(String(entry.amount)) : '')
  const [date, setDate] = useState(entry?.date ?? todayKey)
  const [time, setTime] = useState(entry?.time ?? currentTime)
  const [title, setTitle] = useState(entry?.title ?? '')
  const [category, setCategory] = useState<Category>(entry?.category ?? 'Other')
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    const numeric = Number(amount.replace(/\D/g, ''))
    if (!numeric || numeric <= 0) return setError('Enter an amount greater than zero.')
    onSave({ id: entry?.id ?? `${type}-${Date.now()}`, type, amount: numeric, date, time, title: title.trim(), category })
  }

  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><div className="composer" role="dialog" aria-modal="true" aria-labelledby="composer-title"><div className="composer-heading"><div><p className="eyebrow">{entry ? 'edit record' : 'new record'}</p><h2 id="composer-title">{entry ? 'Edit record' : type === 'income' ? 'Add income' : 'Add expense'}</h2></div><button className="close-composer" onClick={onClose} aria-label="Close"><X size={19} /></button></div><form onSubmit={submit}><label>Amount<input autoFocus inputMode="numeric" value={amount} onChange={event => setAmount(formatInputAmount(event.target.value))} placeholder="0" /></label><label>Name<input value={title} onChange={event => setTitle(event.target.value)} placeholder={type === 'income' ? 'Salary, freelance...' : 'Coffee, groceries...'} /></label><CategoryPicker type={type} value={category} onChange={setCategory} /><div className="form-split"><label>Date<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label><label>Time<input type="time" value={time} onChange={event => setTime(event.target.value)} /></label></div>{type === 'income' && <p className="allocation-note">Income dated on or before the 15th is divided from that date through month end. Later income starts next month.</p>}{error && <p className="form-error">{error}</p>}<button className="submit-record" type="submit">{entry ? 'Save changes' : 'Save record'} <ArrowUp size={16} /></button></form></div></div>
}

export default App
