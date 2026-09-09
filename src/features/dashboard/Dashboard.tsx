'use client'

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { useUser } from '@clerk/nextjs'
import { ArrowClockwise, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { fromKey } from '@/features/finance/allocation'
import { SettingsView } from '@/features/settings/SettingsView'
import { ActivityList } from '@/features/activity/ActivityList'
import { EntryComposer } from '@/features/entries/EntryComposer'
import { MobileTabBar } from '@/features/navigation/MobileTabBar'
import { isAppTab, navigationItems, type AppTab } from '@/features/navigation/navigation'
import { NotificationsView } from '@/features/notifications/NotificationsView'
import { SummaryPanels } from './SummaryPanels'
import { useEntries } from '@/features/entries/use-entries'
import { useDayBoundary } from './use-day-boundary'
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'
import type { Entry, EntryType } from '@/features/entries/types'
import { useBudgets } from '@/features/budgets/use-budgets'
import { AnalysisView } from '@/features/analysis/AnalysisView'
import { OverviewView } from '@/features/overview/OverviewView'
import { useBackgroundPreference } from '@/features/settings/use-background-preference'
import { StateMessage } from '@/components/StateMessage'

function Dashboard() {
  const { user } = useUser()
  const { enabled: gradientBackgroundEnabled } = useBackgroundPreference()
  const {
    entries,
    accumulation,
    persistenceError,
    isLoading: entriesLoading,
    isSaving,
    saveEntry,
    removeEntry,
    refreshEntries,
  } = useEntries(user?.id)
  const { pullDistance, isRefreshing } = usePullToRefresh(refreshEntries)
  const currentDayKey = useDayBoundary()
  const currentDay = fromKey(currentDayKey)
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerType, setComposerType] = useState<EntryType>('expense')
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>()
  const [viewMonth, setViewMonth] = useState(new Date(currentDay.getFullYear(), currentDay.getMonth(), 1, 12))
  const [activeTab, setActiveTab] = useState<AppTab>('today')
  const { budgets, isLoading: budgetsLoading } = useBudgets(user?.id)

  useEffect(() => {
    const nextDay = fromKey(currentDayKey)
    setViewMonth((current) =>
      current.getMonth() === nextDay.getMonth() && current.getFullYear() === nextDay.getFullYear()
        ? current
        : new Date(nextDay.getFullYear(), nextDay.getMonth(), 1, 12),
    )
  }, [currentDayKey])

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab')
    if (isAppTab(requestedTab)) setActiveTab(requestedTab)
  }, [])

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
    <div className={clsx('min-h-dvh', !gradientBackgroundEnabled && 'bg-surface')}>
      <a
        className="sr-only fixed top-3 left-3 z-30 rounded-chip bg-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[.08em] text-white focus:not-sr-only"
        href="#main-content">
        Skip to content
      </a>
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className={clsx(
            'pointer-events-none fixed inset-x-0 top-3 z-30 mx-auto flex w-fit items-center gap-2 rounded-input bg-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[.08em] text-white opacity-95 shadow-toast',
            isRefreshing && 'transition-transform duration-200',
          )}
          style={{ transform: `translateY(${pullDistance}px)` }}
          aria-live="polite">
          <ArrowClockwise size={17} className={clsx(isRefreshing && 'animate-spin')} />
          <span>{isRefreshing ? 'Refreshing' : pullDistance >= 56 ? 'Release to refresh' : 'Pull to refresh'}</span>
        </div>
      )}
      <main id="top" className="mx-auto w-[min(1120px,calc(100%-40px))] pb-20 max-md:w-[calc(100%-32px)] max-md:pb-32">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-6 border-b border-line bg-page/85 pt-[max(10px,env(safe-area-inset-top))] backdrop-blur-xl max-md:-mx-4 max-md:px-4">
          <a
            className="flex shrink-0 items-center gap-2 font-mono text-[11px] tracking-[.04em] text-ink no-underline"
            href="#top">
            <span className="grid size-7 place-items-center rounded-chip bg-ink font-sans text-xs font-semibold text-white">
              e
            </span>
            <span>exodo / έξοδο</span>
          </a>
          <span className="hidden font-mono text-[10px] uppercase tracking-[.1em] text-muted max-md:block">
            {activeTab}
          </span>
          <div className="flex items-center gap-2 max-md:hidden">
            <nav className="flex items-center gap-1" aria-label="Primary navigation">
              {navigationItems.map((tab) => (
                <Button
                  key={tab.id}
                  variant="nav"
                  size="nav"
                  data-active={activeTab === tab.id}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                  type="button"
                  onClick={() => navigateTab(tab.id)}>
                  {tab.label}
                </Button>
              ))}
            </nav>
            <Button size="sm" type="button" onClick={() => openComposer('expense')} aria-label="Record an expense">
              <Plus size={15} weight="bold" /> Record
            </Button>
          </div>
        </header>
        <div id="main-content" tabIndex={-1} className="outline-none">
          {persistenceError && (
            <StateMessage tone="danger" className="mt-4">
              {persistenceError}
            </StateMessage>
          )}
          {activeTab === 'today' && (
            <>
              <section className="grid grid-cols-[minmax(0,1.3fr)_minmax(220px,.7fr)] items-end gap-12 pt-16 pb-14 animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_both] max-md:grid-cols-1 max-md:gap-7 max-md:pt-10 max-md:pb-10">
                <div>
                  <p className="ui-eyebrow mb-4">
                    {currentDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <h1 className="m-0 max-w-[10ch] text-[clamp(48px,7vw,84px)] font-semibold leading-[.92] tracking-[-.095em] max-xs:text-[48px]">
                    Spend what today
                    <br />
                    <em className="not-italic text-ink">makes possible.</em>
                  </h1>
                </div>
                <p className="ui-page-description mb-1 max-md:mb-0">
                  Income becomes a daily allowance. Each expense makes the rest of today visible.
                </p>
              </section>
              <SummaryPanels
                entries={entries}
                entriesLoading={entriesLoading}
                dayKey={currentDayKey}
                budgets={budgets}
                budgetsLoading={budgetsLoading}
                userId={user?.id}
              />
              <div className="pt-24 max-md:pt-16">
                <ActivityList
                  entries={entries}
                  isLoading={entriesLoading}
                  todayKey={currentDayKey}
                  onEdit={(entry) => openComposer(entry.type, entry)}
                  onOpenAnalysis={(monthKey) => {
                    const [year, month] = monthKey.split('-').map(Number)
                    setViewMonth(new Date(year, month - 1, 1, 12))
                    navigateTab('analysis')
                  }}
                />
              </div>
            </>
          )}
          {activeTab === 'overview' && (
            <section className="pt-16 max-md:pt-10">
              <OverviewView accumulation={accumulation} entries={entries} isLoading={entriesLoading} />
            </section>
          )}
          {activeTab === 'notifications' && (
            <section className="pt-16 max-md:pt-10">
              <NotificationsView />
            </section>
          )}
          {activeTab === 'analysis' && (
            <AnalysisView
              entries={entries}
              isLoading={entriesLoading}
              viewMonth={viewMonth}
              onMonthChange={moveMonth}
              onBack={() => navigateTab('today')}
            />
          )}
          {activeTab === 'settings' && (
            <section className="pt-16 max-md:pt-10">
              <SettingsView userId={user?.id} entries={entries} />
            </section>
          )}
        </div>
      </main>
      <footer className="mx-auto flex w-[min(1120px,calc(100%-40px))] justify-between border-t border-line py-5 font-mono text-[10px] tracking-[.06em] text-muted max-md:w-[calc(100%-32px)] max-md:pb-28">
        <span>exodo / έξοδο</span>
        <span>money / a daily practice</span>
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
          onDelete={
            editingEntry
              ? async () => {
                  await removeEntry(editingEntry.id)
                }
              : undefined
          }
          onSave={handleSave}
        />
      )}
    </div>
  )
}

export default Dashboard
