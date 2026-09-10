import * as React from 'react'
import { Progress as ProgressPrimitive } from 'radix-ui'
import { clsx } from 'clsx'

import { cn } from '@/lib/utils'

function Progress({
  className,
  value,
  tone = 'default',
  indicatorClassName,
  trackClassName,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  tone?: 'default' | 'success' | 'danger'
  indicatorClassName?: string
  trackClassName?: string
}) {
  const normalizedValue = Math.min(100, Math.max(0, value ?? 0))
  const indicatorColorClass =
    tone === 'success' ? 'bg-success' : tone === 'danger' ? 'bg-danger' : (indicatorClassName ?? 'bg-ink')
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-tone={tone}
      value={normalizedValue}
      max={100}
      className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-soft', trackClassName, className)}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={clsx('ui-progress-motion h-full w-full flex-1 transition-transform', indicatorColorClass)}
        style={{ transform: `translateX(-${100 - normalizedValue}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
