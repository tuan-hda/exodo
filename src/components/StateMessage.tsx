import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function StateMessage({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'danger' | 'success'
  className?: string
}) {
  return (
    <p
      className={cn(
        'rounded-[14px] border px-3 py-3 text-xs leading-[1.55]',
        tone === 'neutral' && 'border-line bg-soft text-muted',
        tone === 'danger' && 'border-danger/25 bg-danger-soft text-danger',
        tone === 'success' && 'border-success/25 bg-success-soft text-success',
        className,
      )}
      role={tone === 'danger' ? 'alert' : undefined}>
      {children}
    </p>
  )
}
