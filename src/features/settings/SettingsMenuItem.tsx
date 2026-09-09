import type { ReactNode } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export function SettingsMenuItem({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <Button variant="ghost" size="menu" type="button" onClick={onClick}>
      <span className="ui-icon-tile size-9 rounded-full">{icon}</span>
      <span className="min-w-0">
        <strong className="block text-sm font-semibold">{title}</strong>
        <small className="mt-1 block whitespace-normal text-xs leading-[1.45] text-muted">{description}</small>
      </span>
      <ArrowRight className="text-muted" size={18} />
    </Button>
  )
}
