import type { ReactNode } from 'react'
import { Card } from './ui/card'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <Card tone="flat" className={cn('grid justify-items-center gap-3 p-8 text-center', className)}>
      {icon && <div className="ui-icon-tile size-11">{icon}</div>}
      <div className="grid gap-1">
        <h2 className="m-0 text-base font-semibold tracking-[-.03em]">{title}</h2>
        {description && <p className="m-0 max-w-[36ch] text-sm leading-[1.55] text-muted">{description}</p>}
      </div>
      {action}
    </Card>
  )
}
