'use client'

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { useUser } from '@clerk/nextjs'
import { ArrowClockwise } from '@phosphor-icons/react'
import { Button } from '../../components/ui/button'
import { fromKey, toKey } from '../finance/allocation'
import { SettingsView } from '../settings/SettingsView'
import { ActivityList } from '../activity/ActivityList'
import { EntryComposer } from '../entries/EntryComposer'
import { MobileTabBar, type AppTab } from '../navigation/MobileTabBar'
import { NotificationsView } from '../notifications/NotificationsView'
import { SummaryPanels } from './SummaryPanels'
import { useEntries } from '../entries/use-entries'
import { useDayBoundary } from './use-day-boundary'
import { usePullToRefresh } from '../../hooks/use-pull-to-refresh'
import type { Entry, EntryType } from '../entries/types'
import { useBudgets } from '../budgets/use-budgets'
import { AnalysisView } from '../analysis/AnalysisView'
import { OverviewView } from '../overview/OverviewView'
import { useBackgroundPreference } from '../settings/use-background-preference'

function Dashboard() {
  const { user } = useUser()
  const { enabled: gradientBackgroundEnabled } = useBackgroundPreference()
  const { entries, accumulation, persistenceError, isSaving, saveEntry, removeEntry, refreshEntries } = useEntries(
    user?.id,
  )
  const { pullDistance, isRefreshing } = usePullToRefresh(refreshEntries)
  const currentDayKey = useDayBoundary()
  const currentDay = fromKey(currentDayKey)
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerType, setComposerType] = useState<EntryType>('expense')
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>()
  const [viewMonth, setViewMonth] = useState(new Date(currentDay.getFullYear(), currentDay.getMonth(), 1, 12))
  const [selectedDay, setSelectedDay] = useState(currentDayKey)
  const [activeTab, setActiveTab] = useState<AppTab>('today')
  const { budgets } = useBudgets(user?.id)

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
    <div className={clsx('min-h-dvh', !gradientBackgroundEnabled && 'bg-white')}>
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className={clsx(
            'pointer-events-none fixed inset-x-0 top-0 z-[6] mx-auto flex w-fit items-center gap-2 rounded-full bg-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[.06em] text-white opacity-90 shadow-[0_8px_24px_rgb(21_21_21_/_0.16)]',
            isRefreshing && 'transition-transform duration-200',
          )}
          style={{ transform: `translateY(${pullDistance}px)` }}
          aria-live="polite">
          <ArrowClockwise size={17} className={clsx(isRefreshing && 'animate-spin')} />
          <span>{isRefreshing ? 'Refreshing' : pullDistance >= 56 ? 'Release to refresh' : 'Pull to refresh'}</span>
        </div>
      )}
      <main id="top" className="mx-auto w-[min(940px,calc(100%-48px))] max-[700px]:w-[calc(100%-32px)]">
        <header className="sticky top-0 z-[3] flex min-h-12 items-center justify-between border-b border-line bg-white/70 pt-[max(10px,env(safe-area-inset-top))] backdrop-blur-[24px] max-[700px]:-mx-4 max-[700px]:px-4">
          <a className="shrink-0 font-mono text-[11px] tracking-[.06em] text-muted no-underline" href="#top">
            exodo / έξοδο
          </a>
          <span className="hidden font-mono text-[10px] uppercase tracking-[.08em] text-muted max-[700px]:block">
            {activeTab}
          </span>
          <nav className="flex gap-6 max-[700px]:hidden" aria-label="Primary navigation">
            <Button
              variant="ghost"
              className={clsx(
                'relative rounded-xl px-0 py-3 text-xs font-semibold text-muted transition hover:text-ink',
                activeTab === 'today' &&
                  'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink',
              )}
              type="button"
              onClick={() => navigateTab('today')}>
              Today
            </Button>
            <Button
              variant="ghost"
              className={clsx(
                'relative rounded-xl px-0 py-3 text-xs font-semibold text-muted transition hover:text-ink',
                activeTab === 'overview' &&
                  'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink',
              )}
              type="button"
              onClick={() => navigateTab('overview')}>
              Overview
            </Button>
            <Button
              variant="ghost"
              className={clsx(
                'relative rounded-xl px-0 py-3 text-xs font-semibold text-muted transition hover:text-ink',
                activeTab === 'notifications' &&
                  'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink',
              )}
              type="button"
              onClick={() => navigateTab('notifications')}>
              Notifications
            </Button>
            <Button
              variant="ghost"
              className={clsx(
                'relative rounded-xl px-0 py-3 text-xs font-semibold text-muted transition hover:text-ink',
                activeTab === 'settings' &&
                  'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink',
              )}
              type="button"
              onClick={() => navigateTab('settings')}>
              Settings
            </Button>
            <Button
              variant="ghost"
              className={clsx(
                'relative rounded-xl px-0 py-3 text-xs font-semibold text-muted transition hover:text-ink',
                activeTab === 'analysis' &&
                  'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-ink',
              )}
              type="button"
              onClick={() => navigateTab('analysis')}>
              Analysis
            </Button>
          </nav>
        </header>
        {persistenceError && (
          <p
            className="m-0 rounded-[14px] border border-line-strong bg-soft px-3 py-[11px] text-[11px] leading-[1.55] text-danger"
            role="alert">
            {persistenceError}
          </p>
        )}
        {activeTab === 'today' && (
          <>
            <section className="grid grid-cols-[1.2fr_.8fr] items-end gap-10 pt-12 pb-14 animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_both] max-[700px]:grid-cols-1 max-[700px]:gap-7 max-[700px]:pt-8 max-[700px]:pb-[45px]">
              <div>
                <p className="mb-[15px] font-mono text-[11px] uppercase tracking-[.12em] text-muted">
                  {currentDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="mb-0 text-[clamp(46px,7vw,78px)] font-semibold leading-[.98] tracking-[-.09em] max-[430px]:text-[47px]">
                  Spend what today
                  <br />
                  <em className="not-italic text-ink">makes possible.</em>
                </h1>
              </div>
              <p className="mb-2 max-w-[240px] text-sm leading-[1.7] text-muted max-[700px]:mb-0">
                Income becomes a daily allowance. Each expense makes the rest of today visible.
              </p>
            </section>
            <SummaryPanels entries={entries} dayKey={currentDayKey} budgets={budgets} userId={user?.id} />
            <div className="pt-16">
              <ActivityList
                entries={entries}
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
        {activeTab === 'overview' && <OverviewView accumulation={accumulation} />}
        {activeTab === 'notifications' && (
          <section className="pt-6">
            <NotificationsView />
          </section>
        )}
        {activeTab === 'analysis' && (
          <AnalysisView
            entries={entries}
            viewMonth={viewMonth}
            onMonthChange={moveMonth}
            onBack={() => navigateTab('today')}
          />
        )}
        {activeTab === 'settings' && (
          <section className="pt-6">
            <SettingsView userId={user?.id} entries={entries} />
          </section>
        )}
      </main>
      <footer className="mx-auto mt-[110px] flex w-[min(1180px,calc(100%-48px))] justify-between border-t border-line pt-4 font-mono text-[11px] tracking-[.06em] text-muted max-[700px]:mt-20 max-[700px]:w-[calc(100%-32px)]">
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
