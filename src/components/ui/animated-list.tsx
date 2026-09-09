'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef, type Key, type ReactNode } from 'react'
import { motionDurations, motionEase, motionStagger } from '@/lib/motion'
import { cn } from '@/lib/utils'

function AnimatedListItem({ children, index }: { children: ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.25, once: false })
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97, y: 7 }}
      animate={inView || prefersReducedMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.97, y: 7 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              duration: motionDurations.listItem,
              delay: index * motionStagger.listItem,
              ease: motionEase,
            }
      }>
      {children}
    </motion.div>
  )
}

function AnimatedList<T>({
  items,
  children,
  getKey,
  className,
}: {
  items: T[]
  children: (item: T, index: number) => ReactNode
  getKey?: (item: T, index: number) => Key
  className?: string
}) {
  return (
    <div className={cn(className)}>
      {items.map((item, index) => (
        <AnimatedListItem key={getKey?.(item, index) ?? index} index={index}>
          {children(item, index)}
        </AnimatedListItem>
      ))}
    </div>
  )
}

export { AnimatedList }
