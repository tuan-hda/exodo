import { useEffect, useRef, useState } from 'react'

export function usePullToRefresh(onRefresh: () => Promise<boolean>) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const pullDistanceRef = useRef(0)

  useEffect(() => {
    let startY = 0
    let tracking = false

    function handleTouchStart(event: TouchEvent) {
      if (window.scrollY <= 0 && event.touches.length === 1) {
        startY = event.touches[0].clientY
        tracking = true
      }
    }

    function handleTouchMove(event: TouchEvent) {
      if (!tracking) return
      const distance = event.touches[0].clientY - startY
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
      if (!shouldRefresh || isRefreshing) return
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isRefreshing, onRefresh])

  return { pullDistance, isRefreshing }
}
