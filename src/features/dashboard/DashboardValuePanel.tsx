import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { IconTile } from '@/components/IconTile'
import type { IconTileTone } from '@/components/IconTile'
import type { CardTone } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardPanel } from './DashboardPanel'

export function DashboardValuePanel({
  label,
  aside,
  ariaLabel,
  ariaBusy = false,
  valueLabel,
  value,
  description,
  icon,
  className,
  minHeightClassName = 'min-h-[210px]',
  asideClassName,
  iconTone = 'surface',
  tone = 'default',
  descriptionClassName = 'max-w-[38ch]',
  descriptionSkeletonClassName = 'w-56',
}: {
  label: string
  aside: ReactNode
  ariaLabel: string
  ariaBusy?: boolean
  valueLabel?: ReactNode
  value: ReactNode
  description: ReactNode
  icon: ReactNode
  className?: string
  minHeightClassName?: string
  asideClassName?: string
  iconTone?: IconTileTone
  tone?: CardTone
  descriptionClassName?: string
  descriptionSkeletonClassName?: string
}) {
  return (
    <DashboardPanel
      className={clsx(
        'grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] items-center justify-between p-7 text-ink md:p-9',
        minHeightClassName,
        className,
      )}
      asideClassName={clsx('grid justify-items-end gap-3', asideClassName)}
      tone={tone}
      label={label}
      aside={aside}
      ariaLabel={ariaLabel}
      ariaBusy={ariaBusy}>
      <div className="col-start-1 row-start-2 min-w-0">
        {valueLabel && <span className="ui-eyebrow mb-3 block">{valueLabel}</span>}
        <strong className="ui-display-number block text-[clamp(38px,5vw,62px)] font-semibold leading-[.9] tracking-[-.09em]">
          {ariaBusy ? <Skeleton className="h-[clamp(38px,5vw,62px)] w-64 max-w-full" /> : value}
        </strong>
        {ariaBusy ? (
          <Skeleton className={clsx('mt-5 h-3 max-w-full', descriptionSkeletonClassName)} />
        ) : (
          <span className={clsx('mt-5 block font-mono text-[11px] leading-[1.5] text-muted', descriptionClassName)}>
            {description}
          </span>
        )}
      </div>
      <div className="col-start-2 row-start-2 self-center justify-self-end">
        <IconTile size="xl" shape="circle" tone={iconTone}>
          {icon}
        </IconTile>
      </div>
    </DashboardPanel>
  )
}
