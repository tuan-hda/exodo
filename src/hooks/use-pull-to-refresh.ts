import { useEffect, useRef, useState } from 'react'

export function usePullToRefresh(onRefresh: () => Promise<boolean>) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const pullDistanceRef = useRef(0)
  const isRefreshingRef = useRef(false)
  const refreshRef = useRef(onRefresh)

  useEffect(() => {
    refreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    let startY = 0
    let tracking = false
    let disposed = false

    function handleTouchStart(event: TouchEvent) {
      if (window.scrollY <= 0 && event.touches.length === 1) {
        startY = event.touches[0].clientY
        tracking = true
      }
    }

    function handleTouchMove(event: TouchEvent) {
      if (!tracking) return
      const touch = event.touches[0]
      if (!touch) return
      const distance = touch.clientY - startY
      if (distance <= 0) {
        pullDistanceRef.current = 0
        setPullDistance(0)
        return
      }
      if (distance > 8) event.preventDefault()
      const nextDistance = Math.min(distance * 0.45, 84)
      pullDistanceRef.current = nextDistance
      setPullDistance(nextDistance)
    }

    async function handleTouchEnd() {
      if (!tracking) return
      tracking = false
      const shouldRefresh = pullDistanceRef.current >= 56
      pullDistanceRef.current = 0
      setPullDistance(0)
      if (!shouldRefresh || isRefreshingRef.current) return
      isRefreshingRef.current = true
      setIsRefreshing(true)
      try {
        await refreshRef.current()
      } finally {
        if (disposed) return
        isRefreshingRef.current = false
        setIsRefreshing(false)
      }
    }

    function handleTouchCancel() {
      tracking = false
      pullDistanceRef.current = 0
      setPullDistance(0)
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('touchcancel', handleTouchCancel)
    return () => {
      disposed = true
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchCancel)
    }
  }, [])

  return { pullDistance, isRefreshing }
}
