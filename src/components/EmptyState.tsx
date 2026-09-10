import type { ReactNode } from 'react'
import { IconTile, type IconTileTone } from './IconTile'
import { Card } from './ui/card'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon,
  iconTone = 'muted',
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  iconTone?: IconTileTone
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <Card tone="flat" className={cn('grid justify-items-center gap-3 p-8 text-center', className)}>
      {icon && (
        <IconTile size="lg" tone={iconTone}>
          {icon}
        </IconTile>
      )}
      <div className="grid gap-1">
        <h2 className="m-0 text-base font-semibold tracking-[-.03em]">{title}</h2>
        {description && <p className="m-0 max-w-[36ch] text-sm leading-[1.55] text-muted">{description}</p>}
      </div>
      {action}
    </Card>
  )
}
