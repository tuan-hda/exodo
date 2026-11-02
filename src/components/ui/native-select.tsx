import * as React from 'react'
import { CaretDown } from '@phosphor-icons/react'

import { cn } from '@/lib/utils'

function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className="relative min-w-0">
      <select
        data-slot="native-select"
        className={cn(
          'ui-control-motion h-11 w-full min-w-0 appearance-none rounded-input border border-line-strong bg-surface pr-10 pl-3.5 text-base text-ink shadow-input-inset outline-none transition-[border-color,box-shadow] focus:border-ink focus:ring-2 focus:ring-ink/10 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      <CaretDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  )
}

export { NativeSelect }
