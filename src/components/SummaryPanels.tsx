import { ArrowDown, Check } from '@phosphor-icons/react'
import { dailyIncome } from '../allocation'
import { entryDate, formatMoney } from '../lib/entry-utils'
import type { Entry } from '../types/entry'

export function SummaryPanels({ entries, accumulation, dayKey }: { entries: Entry[]; accumulation: number | null; dayKey: string }) {
  const allocationEntries = entries.map(entry => ({ type: entry.type, amount: entry.amount, date: entryDate(entry) }))
  const todayIncome = dailyIncome(allocationEntries, dayKey)
  const todaySpent = entries.filter(entry => entry.type === 'expense' && entryDate(entry) === dayKey).reduce((sum, entry) => sum + entry.amount, 0)
  const availableToday = todayIncome - todaySpent

  return <section className="summary-grid" aria-label="Money summary"><section className={`today-panel ${availableToday < 0 ? 'is-over' : ''}`} aria-label="Today's available amount"><div className="today-copy"><span className="today-label">available today</span><strong>{formatMoney(availableToday)}</strong><span className="today-detail">{todayIncome ? `${formatMoney(todayIncome)} allocated - ${formatMoney(todaySpent)} spent` : 'Add income to set your daily pace'}</span></div><div className="today-mark"><span>{availableToday < 0 ? 'over pace' : 'on pace'}</span><div className="mark-circle"><Check size={24} weight="bold" /></div></div></section><section className="accumulation-panel" aria-label="All-time accumulation"><div className="accumulation-copy"><span className="today-label">accumulated</span><strong>{accumulation === null ? '—' : formatMoney(accumulation)}</strong><span className="today-detail">all income minus all expenses</span></div><div className="accumulation-mark"><span>all time</span><ArrowDown size={23} weight="bold" /></div></section></section>
}
