'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { motionDurations, motionEase } from '@/lib/motion'
import { cn } from '@/lib/utils'

function FadeContent({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={inView || prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
      transition={
        prefersReducedMotion ? { duration: 0 } : { duration: motionDurations.fadeContent, delay, ease: motionEase }
      }>
      {children}
    </motion.div>
  )
}

export { FadeContent }
