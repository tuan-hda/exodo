'use client'

import { motion, useInView } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { motionDurations, motionEase } from '@/lib/motion'
import { cn } from '@/lib/utils'

function FadeContent({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: motionDurations.fadeContent, delay, ease: motionEase }}>
      {children}
    </motion.div>
  )
}

export { FadeContent }
