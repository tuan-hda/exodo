import { Button } from '@/components/ui/button'
import { isNavigationItemActive, navigationItems, type AppTab } from './navigation'

type NavigationItem = (typeof navigationItems)[number]

export function NavigationButton({
  item,
  activeTab,
  onChange,
  mobile = false,
}: {
  item: NavigationItem
  activeTab: AppTab
  onChange: (tab: AppTab) => void
  mobile?: boolean
}) {
  const isActive = isNavigationItemActive(activeTab, item.id)

  return (
    <Button
      variant="nav"
      size={mobile ? 'nav-item' : 'nav'}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      type="button"
      onClick={() => onChange(item.id)}>
      {mobile && <item.Icon size={20} weight={isActive ? 'fill' : 'regular'} />}
      <span className={mobile ? 'ui-nav-label' : undefined}>{mobile ? item.mobileLabel : item.label}</span>
    </Button>
  )
}
