import { Bell, ChartLineUp, Gear, House } from '@phosphor-icons/react'

const todayNavigationItem = { id: 'today', label: 'Today', Icon: House } as const
const overviewNavigationItem = { id: 'overview', label: 'Overview', Icon: ChartLineUp } as const
const notificationsNavigationItem = { id: 'notifications', label: 'Notifications', Icon: Bell } as const
const settingsNavigationItem = { id: 'settings', label: 'Settings', Icon: Gear } as const

export type AppTab = 'today' | 'overview' | 'analysis' | 'notifications' | 'settings'

export const appTabLabels: Record<AppTab, string> = {
  today: 'Today',
  overview: 'Overview',
  analysis: 'Analysis',
  notifications: 'Notifications',
  settings: 'Settings',
}

export const navigationItems = [
  todayNavigationItem,
  overviewNavigationItem,
  notificationsNavigationItem,
  settingsNavigationItem,
] as const

export const mobileNavigationGroups = [
  [todayNavigationItem, overviewNavigationItem],
  [notificationsNavigationItem, settingsNavigationItem],
] as const

export function isAppTab(value: string | null): value is AppTab {
  return value === 'analysis' || navigationItems.some((item) => item.id === value)
}

export function getAppTabFromSearch(search: string): AppTab {
  const requestedTab = new URLSearchParams(search).get('tab')
  return isAppTab(requestedTab) ? requestedTab : 'today'
}
