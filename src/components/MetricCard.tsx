import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { Card } from './ui/card'
import { Skeleton } from './ui/skeleton'

export function MetricCard({
  label,
  value,
  detail,
  valueClassName,
  isLoading = false,
  className,
}: {
  label: string
  value: ReactNode
  detail?: ReactNode
  valueClassName?: string
  isLoading?: boolean
  className?: string
}) {
  return (
    <Card tone="soft" className={clsx('grid gap-2 p-5', className)} aria-busy={isLoading || undefined}>
      <span className="ui-eyebrow">{label}</span>
      {isLoading ? (
        <Skeleton className="h-7 w-32 max-w-full" />
      ) : (
        <strong className={clsx('ui-number text-2xl font-semibold tracking-[-.05em]', valueClassName)}>{value}</strong>
      )}
      {detail && <span className="ui-meta">{detail}</span>}
    </Card>
  )
}
