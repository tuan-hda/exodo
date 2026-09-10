import type { ReactNode } from 'react'
import { Card, type CardAccent, type CardTone } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { cn } from '@/lib/utils'

export function MetricCard({
  label,
  value,
  detail,
  valueClassName,
  tone = 'soft',
  accent,
  isLoading = false,
  className,
}: {
  label: string
  value: ReactNode
  detail?: ReactNode
  valueClassName?: string
  tone?: CardTone
  accent?: CardAccent
  isLoading?: boolean
  className?: string
}) {
  return (
    <Card
      as="article"
      tone={tone}
      accent={accent}
      className={cn('grid gap-2 p-5', className)}
      aria-busy={isLoading || undefined}>
      <span className="ui-eyebrow">{label}</span>
      {isLoading ? (
        <Skeleton className="h-7 w-32 max-w-full" />
      ) : (
        <strong className={cn('ui-number text-2xl font-semibold tracking-[-.05em]', valueClassName)}>{value}</strong>
      )}
      {detail && <span className="ui-meta">{detail}</span>}
    </Card>
  )
}
