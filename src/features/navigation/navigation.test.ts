import { describe, expect, it } from 'vitest'
import {
  appTabLabels,
  getAppTabFromSearch,
  getSettingsPageFromSearch,
  isAppTab,
  isNavigationItemActive,
  mobileNavigationGroups,
  navigationItems,
  updateSearchParams,
} from './navigation'

describe('app navigation', () => {
  it('maps supported query tabs to the active view', () => {
    expect(getAppTabFromSearch('?tab=analysis')).toBe('analysis')
    expect(getAppTabFromSearch('?tab=settings&section=budgets')).toBe('settings')
  })

  it('falls back to today for unknown tabs', () => {
    expect(getAppTabFromSearch('?tab=unknown')).toBe('today')
    expect(getAppTabFromSearch('')).toBe('today')
  })

  it('maps supported settings sections and falls back to the menu', () => {
    expect(getSettingsPageFromSearch('?tab=settings&section=budgets')).toBe('budgets')
    expect(getSettingsPageFromSearch('?section=customization')).toBe('customization')
    expect(getSettingsPageFromSearch('?section=unknown')).toBe('menu')
  })

  it('keeps analysis attached to the today navigation item', () => {
    expect(isNavigationItemActive('analysis', 'today')).toBe(true)
    expect(isNavigationItemActive('analysis', 'settings')).toBe(false)
    expect(isNavigationItemActive('overview', 'today')).toBe(false)
  })

  it('keeps labels and mobile navigation aligned with the supported tabs', () => {
    const itemIds = navigationItems.map((item) => item.id)
    const mobileItemIds = mobileNavigationGroups.flat().map((item) => item.id)

    expect(itemIds).toEqual(['today', 'overview', 'notifications', 'settings'])
    expect(mobileItemIds).toEqual(itemIds)
    expect(itemIds.every((id) => isAppTab(id))).toBe(true)
    expect(appTabLabels.analysis).toBe('Analysis')
    expect(navigationItems.find((item) => item.id === 'notifications')?.mobileLabel).toBe('Inbox')
  })

  it('updates query state without losing the path or hash', () => {
    expect(
      updateSearchParams('https://exodo.test/?tab=settings&section=budgets#main-content', {
        section: null,
        gmail: 'connected',
      }),
    ).toBe('/?tab=settings&gmail=connected#main-content')
  })
})
