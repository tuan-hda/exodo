'use client'

import { motion, useInView } from 'motion/react'
import { useRef, type Key, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

function AnimatedListItem({ children, index }: { children: ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.25, once: false })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.97, y: 7 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.97, y: 7 }}
      transition={{ duration: 0.42, delay: index * 0.045, ease: [0.05, 0.78, 0.18, 1] }}>
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
