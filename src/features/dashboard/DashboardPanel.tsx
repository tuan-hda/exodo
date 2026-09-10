import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { Card } from '@/components/ui/card'

export function DashboardPanel({
  children,
  label,
  aside,
  className = '',
  asideClassName = '',
  ariaLabel,
  ariaLabelledBy,
  ariaBusy,
}: {
  children: ReactNode
  label?: string
  aside?: ReactNode
  className?: string
  asideClassName?: string
  ariaLabel?: string
  ariaLabelledBy?: string
  ariaBusy?: boolean
}) {
  return (
    <Card
      as="section"
      className={clsx(className)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-busy={ariaBusy || undefined}>
      {(label || aside) && (
        <div className="col-span-full flex w-full items-start justify-between gap-4">
          {label && <span className="ui-eyebrow">{label}</span>}
          {aside && (
            <span className={clsx('ui-eyebrow flex shrink-0 items-center gap-3 text-right', asideClassName)}>
              {aside}
            </span>
          )}
        </div>
      )}
      {children}
    </Card>
  )
}
