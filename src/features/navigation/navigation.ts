import { Bell, ChartLineUp, Gear, House } from '@phosphor-icons/react'

const todayNavigationItem = { id: 'today', label: 'Today', mobileLabel: 'Today', Icon: House } as const
const analysisNavigationItem = {
  id: 'analysis',
  label: 'Analysis',
  mobileLabel: 'Analysis',
  Icon: ChartLineUp,
} as const
const notificationsNavigationItem = {
  id: 'notifications',
  label: 'Inbox',
  mobileLabel: 'Inbox',
  Icon: Bell,
} as const
const settingsNavigationItem = { id: 'settings', label: 'Settings', mobileLabel: 'Settings', Icon: Gear } as const

export type AppTab = 'today' | 'analysis' | 'notifications' | 'settings'
export type SettingsPage = 'menu' | 'budgets' | 'savings' | 'customization'

export const appTabLabels: Record<AppTab, string> = {
  today: 'Today',
  analysis: 'Analysis',
  notifications: 'Inbox',
  settings: 'Settings',
}

export const navigationItems = [
  todayNavigationItem,
  analysisNavigationItem,
  notificationsNavigationItem,
  settingsNavigationItem,
] as const

export const mobileNavigationGroups = [
  [todayNavigationItem, analysisNavigationItem],
  [notificationsNavigationItem, settingsNavigationItem],
] as const

export function isAppTab(value: string | null): value is AppTab {
  return navigationItems.some((item) => item.id === value)
}

export function getAppTabFromSearch(search: string): AppTab {
  const requestedTab = new URLSearchParams(search).get('tab')
  if (requestedTab === 'overview') return 'analysis'
  return isAppTab(requestedTab) ? requestedTab : 'today'
}

export function getSettingsPageFromSearch(search: string): SettingsPage {
  const section = new URLSearchParams(search).get('section')
  return section === 'budgets' || section === 'savings' || section === 'customization' ? section : 'menu'
}

export function isNavigationItemActive(activeTab: AppTab, itemId: AppTab) {
  return activeTab === itemId
}

export function updateSearchParams(href: string, updates: Record<string, string | null>) {
  const url = new URL(href)
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) url.searchParams.delete(key)
    else url.searchParams.set(key, value)
  }
  return `${url.pathname}${url.search}${url.hash}`
}
