import { Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { appTabLabels, navigationItems, type AppTab } from '@/features/navigation/navigation'

export function DashboardHeader({
  activeTab,
  onNavigate,
  onRecord,
}: {
  activeTab: AppTab
  onNavigate: (tab: AppTab) => void
  onRecord: () => void
}) {
  return (
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
        {appTabLabels[activeTab]}
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
              onClick={() => onNavigate(tab.id)}>
              {tab.label}
            </Button>
          ))}
        </nav>
        <Button size="sm" type="button" onClick={onRecord} aria-label="Record an expense">
          <Plus size={15} weight="bold" /> Record
        </Button>
      </div>
    </header>
  )
}
