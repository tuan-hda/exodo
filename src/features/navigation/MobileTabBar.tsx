import { Bell, ChartLineUp, Gear, House, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export type AppTab = 'today' | 'overview' | 'analysis' | 'notifications' | 'settings'

export function MobileTabBar({
  activeTab,
  onChange,
  onRecord,
}: {
  activeTab: AppTab
  onChange: (tab: AppTab) => void
  onRecord: () => void
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 hidden grid-cols-5 items-center gap-1 border-t border-line bg-surface/95 px-3 pt-2 backdrop-blur-[16px] max-md:grid"
      style={{ height: 'calc(68px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary navigation">
      <Button
        variant="nav"
        size="nav-item"
        data-active={activeTab === 'today'}
        aria-current={activeTab === 'today' ? 'page' : undefined}
        type="button"
        onClick={() => onChange('today')}>
        <House size={20} weight={activeTab === 'today' ? 'fill' : 'regular'} />
        <span className="font-mono text-[9px] uppercase tracking-[.04em]">Today</span>
      </Button>
      <Button
        variant="nav"
        size="nav-item"
        data-active={activeTab === 'overview'}
        aria-current={activeTab === 'overview' ? 'page' : undefined}
        type="button"
        onClick={() => onChange('overview')}>
        <ChartLineUp size={20} weight={activeTab === 'overview' ? 'fill' : 'regular'} />
        <span className="font-mono text-[9px] uppercase tracking-[.04em]">Overview</span>
      </Button>
      <Button
        size="fab"
        className="self-center justify-self-center"
        type="button"
        onClick={onRecord}
        aria-label="Add income or expense">
        <Plus size={23} weight="bold" />
      </Button>
      <Button
        variant="nav"
        size="nav-item"
        data-active={activeTab === 'notifications'}
        aria-current={activeTab === 'notifications' ? 'page' : undefined}
        type="button"
        onClick={() => onChange('notifications')}>
        <Bell size={20} weight={activeTab === 'notifications' ? 'fill' : 'regular'} />
        <span className="font-mono text-[9px] uppercase tracking-[.04em]">Notifications</span>
      </Button>
      <Button
        variant="nav"
        size="nav-item"
        data-active={activeTab === 'settings'}
        aria-current={activeTab === 'settings' ? 'page' : undefined}
        type="button"
        onClick={() => onChange('settings')}>
        <Gear size={20} weight={activeTab === 'settings' ? 'fill' : 'regular'} />
        <span className="font-mono text-[9px] uppercase tracking-[.04em]">Settings</span>
      </Button>
    </nav>
  )
}
