import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { Card, type cardVariants } from '@/components/ui/card'
import type { VariantProps } from 'class-variance-authority'

export function DashboardPanel({
  children,
  label,
  aside,
  className = '',
  asideClassName = '',
  ariaLabel,
  ariaBusy,
  tone,
}: {
  children: ReactNode
  label?: string
  aside?: ReactNode
  className?: string
  asideClassName?: string
  ariaLabel?: string
  ariaBusy?: boolean
  tone?: VariantProps<typeof cardVariants>['tone']
}) {
  return (
    <Card tone={tone} className={clsx(className)} aria-label={ariaLabel} aria-busy={ariaBusy || undefined}>
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
