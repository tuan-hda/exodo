import { Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { mobileNavigationGroups, navigationItems, type AppTab } from './navigation'

type NavigationItem = (typeof navigationItems)[number]

function MobileNavigationItem({
  item,
  activeTab,
  onChange,
}: {
  item: NavigationItem
  activeTab: AppTab
  onChange: (tab: AppTab) => void
}) {
  const { id, mobileLabel, Icon } = item
  const isActive = activeTab === id

  return (
    <Button
      variant="nav"
      size="nav-item"
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      type="button"
      onClick={() => onChange(id)}>
      <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
      <span className="ui-nav-label">{mobileLabel}</span>
    </Button>
  )
}

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
      className="ui-mobile-tab-bar fixed inset-x-0 bottom-0 z-20 hidden grid-cols-5 items-center gap-1 border-t border-line bg-surface/95 px-3 pt-2 backdrop-blur-[16px] max-md:grid"
      aria-label="Primary navigation">
      {mobileNavigationGroups[0].map((item) => (
        <MobileNavigationItem key={item.id} item={item} activeTab={activeTab} onChange={onChange} />
      ))}
      <Button
        size="fab"
        className="self-center justify-self-center"
        type="button"
        onClick={onRecord}
        aria-label="Add income or expense">
        <Plus size={23} weight="bold" />
      </Button>
      {mobileNavigationGroups[1].map((item) => (
        <MobileNavigationItem key={item.id} item={item} activeTab={activeTab} onChange={onChange} />
      ))}
    </nav>
  )
}
