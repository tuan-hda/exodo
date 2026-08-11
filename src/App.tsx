'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { ArrowDown, ArrowUp, CalendarBlank, CircleNotch, ClockCounterClockwise, House, Plus } from '@phosphor-icons/react'
import { toKey } from './allocation'
import { AuthAccount } from './components/AuthGate'
import { ActivityList } from './components/ActivityList'
import { EntryComposer } from './components/EntryComposer'
import { MonthView } from './components/MonthView'
import { SummaryPanels } from './components/SummaryPanels'
import { useEntries } from './hooks/use-entries'
import { today, todayKey } from './lib/entry-utils'
import type { Entry, EntryType } from './types/entry'

function App() {
  const { user } = useUser()
  const { entries, accumulation, loadedUserId, persistenceError, isSaving, deletingEntryId, saveEntry, removeEntry } = useEntries(user?.id)
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerType, setComposerType] = useState<EntryType>('expense')
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>()
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1, 12))
  const [selectedDay, setSelectedDay] = useState(todayKey)

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

  async function handleSave(entry: Entry) {
    const saved = await saveEntry(entry, Boolean(editingEntry))
    if (saved) {
      setComposerOpen(false)
      setEditingEntry(undefined)
    }
    return saved
  }

  if (loadedUserId !== user?.id) return <div className="app-shell loading-shell" aria-busy="true"><div className="loading-state"><CircleNotch className="loading-spinner" size={18} /><span>Loading records</span></div></div>

  return <div className="app-shell"><header className="topbar"><a className="wordmark" href="#top" aria-label="Exodo home"><span className="wordmark-mark">e</span><span>exodo</span></a><p className="topbar-note">personal money, in motion</p><div className="topbar-actions"><AuthAccount /><button className="topbar-add" onClick={() => openComposer('expense')}><Plus size={16} weight="bold" /> Record</button></div></header><main id="top" className="page">
    {persistenceError && <p className="form-error" role="alert">{persistenceError}</p>}
    <section className="intro"><div><p className="eyebrow">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p><h1>Spend what today<br /><em>makes possible.</em></h1></div><p className="intro-copy">Income becomes a daily allowance. Each expense makes the rest of today visible.</p></section>
    <div id="today"><SummaryPanels entries={entries} accumulation={accumulation} /></div>
    <section className="capture-grid"><div className="section-heading"><p className="eyebrow">make a note</p><h2>Keep the record<br />light.</h2><p>Two entries are enough to start: what came in, and what went out.</p></div><div className="capture-actions"><button className="capture-button income" onClick={() => openComposer('income')}><span className="capture-icon"><ArrowDown size={20} weight="bold" /></span><span><strong>Add income</strong><small>Spread it across its month</small></span><kbd>I</kbd><ArrowUp className="capture-arrow" size={18} /></button><button className="capture-button expense" onClick={() => openComposer('expense')}><span className="capture-icon"><ArrowUp size={20} weight="bold" /></span><span><strong>Add expense</strong><small>Subtract it from today</small></span><kbd>N</kbd><ArrowUp className="capture-arrow" size={18} /></button><div className="shortcut-hint"><span>Shortcuts</span><kbd>←</kbd><kbd>→</kbd><span>month</span><kbd>Esc</kbd><span>close</span></div></div></section>
    <div id="month"><MonthView entries={entries} viewMonth={viewMonth} selectedDay={selectedDay} onMonthChange={moveMonth} onSelectDay={setSelectedDay} /></div>
    <div id="activity"><ActivityList entries={entries} deletingEntryId={deletingEntryId} onEdit={entry => openComposer(entry.type, entry)} onRemove={removeEntry} /></div>
  </main><footer className="footer"><span>exodo / έξοδο</span><span>money is a daily practice</span></footer><nav className="mobile-nav" aria-label="Primary navigation"><a href="#today"><House size={20} weight="regular" /><span>Today</span></a><a href="#month"><CalendarBlank size={20} weight="regular" /><span>Month</span></a><button className="mobile-nav-record" type="button" onClick={() => openComposer('expense')} aria-label="Add expense"><Plus size={23} weight="bold" /></button><a href="#activity"><ClockCounterClockwise size={20} weight="regular" /><span>Activity</span></a><div className="mobile-nav-profile"><AuthAccount /></div></nav>{composerOpen && <EntryComposer key={editingEntry?.id ?? composerType} entry={editingEntry} type={composerType} isSaving={isSaving} onClose={() => { setComposerOpen(false); setEditingEntry(undefined) }} onTypeChange={setComposerType} onSave={handleSave} />}</div>
}

export default App
