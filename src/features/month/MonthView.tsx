import { useMemo } from 'react'
import { dailyIncome, fromKey, toKey } from '../finance/allocation'
import { entryDate, formatShort, monthDays } from '../entries/entry-utils'
import type { Entry } from '../entries/types'

export function MonthView({
  entries,
  viewMonth,
  selectedDay,
  todayKey,
  onMonthChange,
  onSelectDay,
}: {
  entries: Entry[]
  viewMonth: Date
  selectedDay: string
  todayKey: string
  onMonthChange: (delta: number) => void
  onSelectDay: (day: string) => void
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
    <section className="month-section">
      <div className="section-heading month-heading">
        <div>
          <p className="eyebrow">the daily view</p>
          <h2>{viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        </div>
        <div className="month-controls">
          <button onClick={() => onMonthChange(-1)} aria-label="Previous month">
            ‹
          </button>
          <button onClick={() => onMonthChange(1)} aria-label="Next month">
            ›
          </button>
        </div>
      </div>
      <div
        className="month-calendar"
        aria-label={`${viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} calendar`}>
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {calendarCells.map((row, index) =>
            row ? (
              <button
                key={row.key}
                type="button"
                className={`calendar-day ${row.key === selectedDay ? 'selected' : ''} ${row.key === todayKey ? 'today' : ''}`}
                onClick={() => onSelectDay(row.key)}>
                <span>{row.date.getDate()}</span>
                {(row.income || row.spent) > 0 && <i />}
              </button>
            ) : (
              <span className="calendar-blank" key={`blank-${index}`} />
            ),
          )}
        </div>
      </div>
      <div className="month-summary">
        <span>
          <b>{formatShort(monthIncome)}</b> allocated
        </span>
        <span>
          <b>{formatShort(monthSpent)}</b> spent
        </span>
        <span>
          <b>{currentMonthEntries.length}</b> records
        </span>
      </div>
      <div className="day-list">
        {visibleDailyRows.map((row) => (
          <div
            key={row.key}
            className={`day-row ${row.key === todayKey ? 'today' : ''} ${row.key === selectedDay ? 'selected' : ''}`}>
            <span className="day-name">{row.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className="day-number">{row.date.getDate()}</span>
            <span className="day-line" />
            <span className="day-allocation">{row.income ? `+${formatShort(row.income)}` : 'no allocation'}</span>
            <strong className={row.left < 0 ? 'negative' : ''}>
              {row.income || row.spent ? formatShort(row.left) : '·'}
            </strong>
          </div>
        ))}
      </div>
    </section>
  )
}
