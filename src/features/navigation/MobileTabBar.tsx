import { Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { mobileNavigationGroups, type AppTab } from './navigation'
import { NavigationButton } from './NavigationButton'

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
      className="ui-mobile-tab-bar fixed inset-x-0 bottom-0 z-navigation hidden grid-cols-5 items-center gap-1 border-t border-line bg-surface/95 px-3 pt-2 backdrop-blur-[16px] max-md:grid"
      aria-label="Primary navigation">
      {mobileNavigationGroups[0].map((item) => (
        <NavigationButton key={item.id} item={item} activeTab={activeTab} onChange={onChange} mobile />
      ))}
      <Button
        variant="expense-primary"
        size="fab"
        className="self-center justify-self-center"
        type="button"
        onClick={onRecord}
        aria-label="Add income or expense">
        <Plus size={23} weight="bold" />
      </Button>
      {mobileNavigationGroups[1].map((item) => (
        <NavigationButton key={item.id} item={item} activeTab={activeTab} onChange={onChange} mobile />
      ))}
    </nav>
  )
}
