import * as React from 'react'

import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('block animate-pulse rounded-input bg-soft', className)}
      {...props}
    />
  )
}

export { Skeleton }
