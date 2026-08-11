'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { ArrowDown, ArrowUp, CircleNotch } from '@phosphor-icons/react'
import { toKey } from './allocation'
import { ActivityList } from './components/ActivityList'
import { EntryComposer } from './components/EntryComposer'
import { MonthView } from './components/MonthView'
import { MobileTabBar, type AppTab } from './components/MobileTabBar'
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
  const [activeTab, setActiveTab] = useState<AppTab>('today')

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

  function navigateTab(tab: AppTab) {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  return <div className="app-shell"><main id="top" className="page">
    <nav className="desktop-tabs" aria-label="Primary navigation"><button className={activeTab === 'today' ? 'active' : ''} type="button" onClick={() => navigateTab('today')}>Today</button><button className={activeTab === 'month' ? 'active' : ''} type="button" onClick={() => navigateTab('month')}>Month</button><button className={activeTab === 'activity' ? 'active' : ''} type="button" onClick={() => navigateTab('activity')}>Activity</button></nav>
    {persistenceError && <p className="form-error" role="alert">{persistenceError}</p>}
    {activeTab === 'today' && <><section className="intro"><div><p className="eyebrow">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p><h1>Spend what today<br /><em>makes possible.</em></h1></div><p className="intro-copy">Income becomes a daily allowance. Each expense makes the rest of today visible.</p></section><SummaryPanels entries={entries} accumulation={accumulation} /><section className="capture-grid"><div className="section-heading"><p className="eyebrow">make a note</p><h2>Keep the record<br />light.</h2><p>Two entries are enough to start: what came in, and what went out.</p></div><div className="capture-actions"><button className="capture-button income" onClick={() => openComposer('income')}><span className="capture-icon"><ArrowDown size={20} weight="bold" /></span><span><strong>Add income</strong><small>Spread it across its month</small></span><kbd>I</kbd><ArrowUp className="capture-arrow" size={18} /></button><button className="capture-button expense" onClick={() => openComposer('expense')}><span className="capture-icon"><ArrowUp size={20} weight="bold" /></span><span><strong>Add expense</strong><small>Subtract it from today</small></span><kbd>N</kbd><ArrowUp className="capture-arrow" size={18} /></button><div className="shortcut-hint"><span>Shortcuts</span><kbd>←</kbd><kbd>→</kbd><span>month</span><kbd>Esc</kbd><span>close</span></div></div></section></>}
    {activeTab === 'month' && <section className="tab-view"><MonthView entries={entries} viewMonth={viewMonth} selectedDay={selectedDay} onMonthChange={moveMonth} onSelectDay={setSelectedDay} /></section>}
    {activeTab === 'activity' && <section className="tab-view"><ActivityList entries={entries} deletingEntryId={deletingEntryId} onEdit={entry => openComposer(entry.type, entry)} onRemove={removeEntry} /></section>}
  </main><footer className="footer"><span>exodo / έξοδο</span><span>money is a daily practice</span></footer><MobileTabBar activeTab={activeTab} onChange={navigateTab} onRecord={() => openComposer('expense')} />{composerOpen && <EntryComposer key={editingEntry?.id ?? composerType} entry={editingEntry} type={composerType} isSaving={isSaving} onClose={() => { setComposerOpen(false); setEditingEntry(undefined) }} onTypeChange={setComposerType} onSave={handleSave} />}</div>
}

export default App
