import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'ui-control-motion h-11 min-w-0 w-full rounded-input border border-line-strong bg-surface px-3.5 text-base text-ink shadow-input-inset outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-ink focus:ring-2 focus:ring-ink/10 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
