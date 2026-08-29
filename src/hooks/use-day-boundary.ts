'use client'

import { useEffect, useState } from 'react'
import { getDayKey } from '../lib/entry-utils'

export function useDayBoundary() {
  const [dayKey, setDayKey] = useState(() => getDayKey())

  useEffect(() => {
    let timeoutId: number

    function scheduleNextReset() {
      const now = new Date()
      const nextMidnight = new Date(now)
      nextMidnight.setHours(24, 0, 0, 0)
      timeoutId = window.setTimeout(
        () => {
          setDayKey(getDayKey())
          scheduleNextReset()
        },
        Math.max(nextMidnight.getTime() - now.getTime(), 1000),
      )
    }

    scheduleNextReset()
    return () => window.clearTimeout(timeoutId)
  }, [])

  return dayKey
}
