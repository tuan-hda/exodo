import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { Card } from '../../components/ui/card'

export function DashboardPanel({
  children,
  label,
  aside,
  className = '',
  asideClassName = '',
  ariaLabel,
}: {
  children: ReactNode
  label?: string
  aside?: ReactNode
  className?: string
  asideClassName?: string
  ariaLabel?: string
}) {
  return (
    <Card className={clsx(className)} aria-label={ariaLabel}>
      {(label || aside) && (
        <div className="col-span-full flex w-full items-start justify-between gap-4">
          {label && <span className="font-mono text-[11px] uppercase tracking-[.12em] text-muted">{label}</span>}
          {aside && (
            <span
              className={clsx(
                'flex shrink-0 items-center gap-3 text-right font-mono text-[11px] uppercase tracking-[.12em] text-muted',
                asideClassName,
              )}>
              {aside}
            </span>
          )}
        </div>
      )}
      {children}
    </Card>
  )
}
