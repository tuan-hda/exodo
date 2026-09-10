'use client'

import { useCallback, useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { getAppTabFromSearch, type AppTab, updateSearchParams } from './navigation'

export function useAppNavigation() {
  const prefersReducedMotion = useReducedMotion()
  const [activeTab, setActiveTab] = useState<AppTab>(() =>
    typeof window === 'undefined' ? 'today' : getAppTabFromSearch(window.location.search),
  )

  useEffect(() => {
    const syncTab = () => setActiveTab(getAppTabFromSearch(window.location.search))
    syncTab()
    window.addEventListener('popstate', syncTab)
    return () => window.removeEventListener('popstate', syncTab)
  }, [])

  const navigate = useCallback(
    (tab: AppTab, section?: string | null) => {
      setActiveTab(tab)
      const updates: Record<string, string | null> = {
        tab: tab === 'today' ? null : tab,
        section: tab === 'settings' ? (section ?? null) : null,
      }
      window.history.pushState(null, '', updateSearchParams(window.location.href, updates))
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    },
    [prefersReducedMotion],
  )

  return { activeTab, navigate }
}
