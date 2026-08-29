'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { ArrowClockwise } from '@phosphor-icons/react'
import { fromKey, toKey } from './allocation'
import { AccountView } from './components/AccountView'
import { ActivityList } from './components/ActivityList'
import { EntryComposer } from './components/EntryComposer'
import { MonthView } from './components/MonthView'
import { MobileTabBar, type AppTab } from './components/MobileTabBar'
import { NotificationsView } from './components/NotificationsView'
import { SummaryPanels } from './components/SummaryPanels'
import { useEntries } from './hooks/use-entries'
import { useDayBoundary } from './hooks/use-day-boundary'
import { usePullToRefresh } from './hooks/use-pull-to-refresh'
import type { Entry, EntryType } from './types/entry'

function App() {
  const { user } = useUser()
  const { entries, accumulation, persistenceError, isSaving, deletingEntryId, saveEntry, removeEntry, refreshEntries } =
    useEntries(user?.id)
  const { pullDistance, isRefreshing } = usePullToRefresh(refreshEntries)
  const currentDayKey = useDayBoundary()
  const currentDay = fromKey(currentDayKey)
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerType, setComposerType] = useState<EntryType>('expense')
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>()
  const [viewMonth, setViewMonth] = useState(new Date(currentDay.getFullYear(), currentDay.getMonth(), 1, 12))
  const [selectedDay, setSelectedDay] = useState(currentDayKey)
  const [activeTab, setActiveTab] = useState<AppTab>('today')

  useEffect(() => {
    setSelectedDay(currentDayKey)
    const nextDay = fromKey(currentDayKey)
    setViewMonth((current) =>
      current.getMonth() === nextDay.getMonth() && current.getFullYear() === nextDay.getFullYear()
        ? current
        : new Date(nextDay.getFullYear(), nextDay.getMonth(), 1, 12),
    )
  }, [currentDayKey])

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
    setViewMonth((current) => {
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

  return (
    <div className="app-shell">
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className={`pull-refresh-indicator ${isRefreshing ? 'refreshing' : ''}`}
          style={{ transform: `translateY(${pullDistance}px)` }}
          aria-live="polite">
          <ArrowClockwise size={17} className={isRefreshing ? 'loading-spinner' : ''} />
          <span>{isRefreshing ? 'Refreshing' : pullDistance >= 56 ? 'Release to refresh' : 'Pull to refresh'}</span>
        </div>
      )}
      <main id="top" className="page">
        <header className="app-header">
          <a className="app-wordmark" href="#top">
            exodo / έξοδο
          </a>
          <span className="app-header-current">{activeTab}</span>
          <nav className="desktop-tabs" aria-label="Primary navigation">
            <button
              className={activeTab === 'today' ? 'active' : ''}
              type="button"
              onClick={() => navigateTab('today')}>
              Today
            </button>
            <button
              className={activeTab === 'month' ? 'active' : ''}
              type="button"
              onClick={() => navigateTab('month')}>
              Month
            </button>
            <button
              className={activeTab === 'notifications' ? 'active' : ''}
              type="button"
              onClick={() => navigateTab('notifications')}>
              Notifications
            </button>
            <button
              className={activeTab === 'account' ? 'active' : ''}
              type="button"
              onClick={() => navigateTab('account')}>
              Account
            </button>
          </nav>
        </header>
        {persistenceError && (
          <p className="form-error" role="alert">
            {persistenceError}
          </p>
        )}
        {activeTab === 'today' && (
          <>
            <section className="intro">
              <div>
                <p className="eyebrow">
                  {currentDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1>
                  Spend what today
                  <br />
                  <em>makes possible.</em>
                </h1>
              </div>
              <p className="intro-copy">
                Income becomes a daily allowance. Each expense makes the rest of today visible.
              </p>
            </section>
            <SummaryPanels entries={entries} accumulation={accumulation} dayKey={currentDayKey} />
            <div className="home-activity">
              <ActivityList
                entries={entries}
                todayKey={currentDayKey}
                deletingEntryId={deletingEntryId}
                onEdit={(entry) => openComposer(entry.type, entry)}
                onRemove={removeEntry}
              />
            </div>
          </>
        )}
        {activeTab === 'month' && (
          <section className="tab-view">
            <MonthView
              entries={entries}
              viewMonth={viewMonth}
              selectedDay={selectedDay}
              todayKey={currentDayKey}
              onMonthChange={moveMonth}
              onSelectDay={setSelectedDay}
            />
          </section>
        )}
        {activeTab === 'notifications' && (
          <section className="tab-view">
            <NotificationsView />
          </section>
        )}
        {activeTab === 'account' && (
          <section className="tab-view">
            <AccountView />
          </section>
        )}
      </main>
      <footer className="footer">
        <span>exodo / έξοδο</span>
        <span>money is a daily practice</span>
      </footer>
      <MobileTabBar activeTab={activeTab} onChange={navigateTab} onRecord={() => openComposer('expense')} />
      {composerOpen && (
        <EntryComposer
          key={editingEntry?.id ?? composerType}
          entry={editingEntry}
          type={composerType}
          dayKey={currentDayKey}
          isSaving={isSaving}
          onClose={() => {
            setComposerOpen(false)
            setEditingEntry(undefined)
          }}
          onTypeChange={setComposerType}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

export default App
