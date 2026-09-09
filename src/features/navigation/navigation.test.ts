import { describe, expect, it } from 'vitest'
import { appTabLabels, getAppTabFromSearch, isAppTab, mobileNavigationGroups, navigationItems } from './navigation'

describe('app navigation', () => {
  it('maps supported query tabs to the active view', () => {
    expect(getAppTabFromSearch('?tab=analysis')).toBe('analysis')
    expect(getAppTabFromSearch('?tab=settings&section=budgets')).toBe('settings')
  })

  it('falls back to today for unknown tabs', () => {
    expect(getAppTabFromSearch('?tab=unknown')).toBe('today')
    expect(getAppTabFromSearch('')).toBe('today')
  })

  it('keeps labels and mobile navigation aligned with the supported tabs', () => {
    const itemIds = navigationItems.map((item) => item.id)
    const mobileItemIds = mobileNavigationGroups.flat().map((item) => item.id)

    expect(itemIds).toEqual(['today', 'overview', 'notifications', 'settings'])
    expect(mobileItemIds).toEqual(itemIds)
    expect(itemIds.every((id) => isAppTab(id))).toBe(true)
    expect(appTabLabels.analysis).toBe('Analysis')
  })
})
