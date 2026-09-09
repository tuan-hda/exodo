import type { ReactNode } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

export function PageHeader({
  eyebrow,
  title,
  description,
  backLabel,
  onBack,
  actions,
  className,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  backLabel?: string
  onBack?: () => void
  actions?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('grid gap-8', className)}>
      {onBack && (
        <Button variant="outline" size="sm" className="justify-self-start" type="button" onClick={onBack}>
          <ArrowLeft size={15} /> {backLabel ?? 'Back'}
        </Button>
      )}
      <div className="flex items-end justify-between gap-6 max-md:flex-col max-md:items-start max-md:gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="ui-eyebrow mb-3">{eyebrow}</p>}
          <h1 className="ui-page-title m-0">{title}</h1>
          {description && <p className="ui-page-description mt-4 mb-0">{description}</p>}
        </div>
        {actions && <div className="shrink-0 max-md:w-full">{actions}</div>}
      </div>
    </header>
  )
}
