import { Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { navigationItems, type AppTab } from './navigation'

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
      {navigationItems.slice(0, 2).map(({ id, label, Icon }) => (
        <Button
          key={id}
          variant="nav"
          size="nav-item"
          data-active={activeTab === id}
          aria-current={activeTab === id ? 'page' : undefined}
          type="button"
          onClick={() => onChange(id)}>
          <Icon size={20} weight={activeTab === id ? 'fill' : 'regular'} />
          <span className="ui-nav-label">{label}</span>
        </Button>
      ))}
      <Button
        size="fab"
        className="self-center justify-self-center"
        type="button"
        onClick={onRecord}
        aria-label="Add income or expense">
        <Plus size={23} weight="bold" />
      </Button>
      {navigationItems.slice(2).map(({ id, label, Icon }) => (
        <Button
          key={id}
          variant="nav"
          size="nav-item"
          data-active={activeTab === id}
          aria-current={activeTab === id ? 'page' : undefined}
          type="button"
          onClick={() => onChange(id)}>
          <Icon size={20} weight={activeTab === id ? 'fill' : 'regular'} />
          <span className="ui-nav-label">{label}</span>
        </Button>
      ))}
    </nav>
  )
}
