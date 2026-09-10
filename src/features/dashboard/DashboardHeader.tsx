import { Plus } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { BrandLockup } from '@/components/BrandLockup'
import { Button } from '@/components/ui/button'
import { appTabLabels, navigationItems, type AppTab } from '@/features/navigation/navigation'
import { NavigationButton } from '@/features/navigation/NavigationButton'

export function DashboardHeader({
  activeTab,
  onNavigate,
  onRecord,
  gradientBackgroundEnabled,
}: {
  activeTab: AppTab
  onNavigate: (tab: AppTab) => void
  onRecord: () => void
  gradientBackgroundEnabled: boolean
}) {
  return (
    <header
      className={clsx(
        'sticky top-0 z-navigation flex min-h-16 items-center justify-between gap-6 border-b border-line pt-[max(10px,env(safe-area-inset-top))] backdrop-blur-xl max-md:-mx-4 max-md:px-4',
        gradientBackgroundEnabled ? 'bg-page' : 'bg-surface',
      )}>
      <BrandLockup
        href="/"
        className="shrink-0"
        onClick={(event) => {
          event.preventDefault()
          onNavigate('today')
        }}
      />
      <span className="hidden font-mono text-[10px] uppercase tracking-[.1em] text-muted max-md:block">
        {appTabLabels[activeTab]}
      </span>
      <div className="flex items-center gap-2 max-md:hidden">
        <nav className="flex items-center gap-1" aria-label="Primary navigation">
          {navigationItems.map((tab) => (
            <NavigationButton key={tab.id} item={tab} activeTab={activeTab} onChange={onNavigate} />
          ))}
        </nav>
        <Button variant="default" size="sm" type="button" onClick={onRecord} aria-label="Record an expense">
          <Plus size={15} weight="bold" /> Record
        </Button>
      </div>
    </header>
  )
}
