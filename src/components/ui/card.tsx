import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'section'>) {
  return (
    <section
      data-slot="card"
      className={cn('rounded-[28px] border border-line bg-white shadow-[0_8px_24px_rgb(21_21_21_/_0.06)]', className)}
      {...props}
    />
  )
}

export { Card }
