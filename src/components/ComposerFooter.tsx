import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function ComposerFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative z-sticky mt-2 flex items-start gap-2.5 border-t border-line bg-surface pt-3 max-md:sticky max-md:bottom-0 max-md:-mx-5 max-md:mt-auto max-md:px-5 max-md:pt-4',
        className,
      )}>
      {children}
    </div>
  )
}
