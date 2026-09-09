'use client'

import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { motionDurations, motionEase } from '@/lib/motion'
import { cn } from '@/lib/utils'

function CountUp({
  value,
  formatValue = (currentValue) => Math.round(currentValue).toLocaleString('en-US'),
  duration = motionDurations.countUp,
  className,
}: {
  value: number
  formatValue?: (value: number) => string
  duration?: number
  className?: string
}) {
  const motionValue = useMotionValue(0)
  const prefersReducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(() => formatValue(0))

  useMotionValueEvent(motionValue, 'change', (latest) => {
    setDisplayValue(formatValue(latest))
  })

  useEffect(() => {
    if (prefersReducedMotion) {
      motionValue.set(value)
      return
    }

    const controls = animate(motionValue, value, {
      duration,
      ease: motionEase,
    })

    return () => controls.stop()
  }, [duration, motionValue, prefersReducedMotion, value])

  return <span className={cn(className)}>{displayValue}</span>
}

export { CountUp }
