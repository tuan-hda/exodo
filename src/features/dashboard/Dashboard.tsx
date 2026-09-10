'use client'

import { useCallback, useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { useUser } from '@clerk/nextjs'
import { ArrowClockwise } from '@phosphor-icons/react'
import { fromKey } from '@/lib/date'
import { SettingsView } from '@/features/settings/SettingsView'
import { ActivityList } from '@/features/activity/ActivityList'
import { EntryComposer } from '@/features/entries/EntryComposer'
import { MobileTabBar } from '@/features/navigation/MobileTabBar'
import { useAppNavigation } from '@/features/navigation/use-app-navigation'
import { NotificationsView } from '@/features/notifications/NotificationsView'
import { SummaryPanels } from './SummaryPanels'
import { useEntries } from '@/features/entries/use-entries'
import { useDayBoundary } from './use-day-boundary'
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'
import { useBudgets } from '@/features/budgets/use-budgets'
import { useSavings } from '@/features/savings/use-savings'
import { AnalysisView } from '@/features/analysis/AnalysisView'
import { OverviewView } from '@/features/overview/OverviewView'
import { useBackgroundPreference } from '@/features/settings/use-background-preference'
import { StateMessage } from '@/components/StateMessage'
import { DashboardHeader } from './DashboardHeader'
import { formatLongDate } from '@/lib/date-format'
import { useEntryComposer } from '@/features/entries/use-entry-composer'
import { useDashboardShortcuts } from './use-dashboard-shortcuts'

function Dashboard() {
  const { user } = useUser()
  const backgroundPreference = useBackgroundPreference()
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
  const [viewMonth, setViewMonth] = useState(new Date(currentDay.getFullYear(), currentDay.getMonth(), 1, 12))
  const { activeTab, navigate } = useAppNavigation()
  const budgetState = useBudgets(user?.id)
  const savings = useSavings(user?.id, entries, entriesLoading)
  const composer = useEntryComposer({ saveEntry, removeEntry })

  const moveMonth = useCallback((delta: number) => {
    setViewMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + delta, 1, 12)
      return next
    })
  }, [])

  useEffect(() => {
    const nextDay = fromKey(currentDayKey)
    setViewMonth((current) =>
      current.getMonth() === nextDay.getMonth() && current.getFullYear() === nextDay.getFullYear()
        ? current
        : new Date(nextDay.getFullYear(), nextDay.getMonth(), 1, 12),
    )
  }, [currentDayKey])

  useDashboardShortcuts({
    composerOpen: composer.isOpen,
    closeComposer: composer.close,
    openComposer: composer.open,
    moveMonth,
  })

  return (
    <div className={clsx('min-h-dvh', !backgroundPreference.enabled && 'bg-surface')}>
      <a
        className="sr-only fixed top-3 left-3 z-system rounded-chip bg-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[.08em] text-white focus:not-sr-only"
        href="#main-content">
        Skip to content
      </a>
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className={clsx(
            'pointer-events-none fixed inset-x-0 top-3 z-system mx-auto flex w-fit items-center gap-2 rounded-input bg-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[.08em] text-white opacity-95 shadow-toast',
            isRefreshing && 'ui-control-motion transition-transform',
          )}
          style={{ transform: `translateY(${pullDistance}px)` }}
          aria-live="polite">
          <ArrowClockwise size={17} className={clsx(isRefreshing && 'animate-spin')} />
          <span>{isRefreshing ? 'Refreshing' : pullDistance >= 56 ? 'Release to refresh' : 'Pull to refresh'}</span>
        </div>
      )}
      <main id="top" className="ui-dashboard-frame pb-20 max-md:pb-32">
        <DashboardHeader
          activeTab={activeTab}
          onNavigate={navigate}
          onRecord={() => composer.open('expense')}
          gradientBackgroundEnabled={backgroundPreference.enabled}
        />
        <div id="main-content" tabIndex={-1} className="outline-none">
          {persistenceError && (
            <StateMessage tone="danger" className="mt-4">
              {persistenceError}
            </StateMessage>
          )}
          {activeTab === 'today' && (
            <>
              <section className="ui-page-enter grid grid-cols-[minmax(0,1.3fr)_minmax(220px,.7fr)] items-end gap-12 pt-16 pb-14 max-md:grid-cols-1 max-md:gap-7 max-md:pt-10 max-md:pb-10">
                <div>
                  <p className="ui-eyebrow mb-4">{formatLongDate(currentDay)}</p>
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
                budgets={budgetState.budgets}
                budgetsLoading={budgetState.isLoading}
                savings={savings}
                onOpenBudgetSettings={() => navigate('settings', 'budgets')}
              />
              <div className="pt-24 max-md:pt-16">
                <ActivityList
                  entries={entries}
                  isLoading={entriesLoading}
                  todayKey={currentDayKey}
                  onEdit={(entry) => composer.open(entry.type, entry)}
                  onOpenAnalysis={(monthKey) => {
                    const [year, month] = monthKey.split('-').map(Number)
                    setViewMonth(new Date(year, month - 1, 1, 12))
                    navigate('analysis')
                  }}
                />
              </div>
            </>
          )}
          {activeTab === 'overview' && (
            <OverviewView accumulation={accumulation} entries={entries} isLoading={entriesLoading} />
          )}
          {activeTab === 'notifications' && <NotificationsView />}
          {activeTab === 'analysis' && (
            <AnalysisView
              entries={entries}
              isLoading={entriesLoading}
              viewMonth={viewMonth}
              onMonthChange={moveMonth}
              onBack={() => navigate('today')}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView savings={savings} budgets={budgetState} backgroundPreference={backgroundPreference} />
          )}
        </div>
      </main>
      <footer className="ui-dashboard-frame flex justify-between border-t border-line py-5 font-mono text-[10px] tracking-[.06em] text-muted max-md:pb-28">
        <span>exodo / έξοδο</span>
        <span>money / a daily practice</span>
      </footer>
      <MobileTabBar activeTab={activeTab} onChange={navigate} onRecord={() => composer.open('expense')} />
      {composer.isOpen && (
        <EntryComposer
          key={composer.entry?.id ?? composer.type}
          entry={composer.entry}
          type={composer.type}
          dayKey={currentDayKey}
          isSaving={isSaving}
          onClose={composer.close}
          onTypeChange={composer.setType}
          persistenceError={persistenceError}
          onDelete={composer.entry ? composer.remove : undefined}
          onSave={composer.save}
        />
      )}
    </div>
  )
}

export default Dashboard
