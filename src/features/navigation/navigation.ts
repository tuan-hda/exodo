import { Bell, ChartLineUp, Gear, House } from '@phosphor-icons/react'

export type AppTab = 'today' | 'overview' | 'analysis' | 'notifications' | 'settings'

export const navigationItems = [
  { id: 'today', label: 'Today', Icon: House },
  { id: 'overview', label: 'Overview', Icon: ChartLineUp },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'settings', label: 'Settings', Icon: Gear },
] as const

export function isAppTab(value: string | null): value is AppTab {
  return value === 'analysis' || navigationItems.some((item) => item.id === value)
}

export function getAppTabFromSearch(search: string): AppTab {
  const requestedTab = new URLSearchParams(search).get('tab')
  return isAppTab(requestedTab) ? requestedTab : 'today'
}
