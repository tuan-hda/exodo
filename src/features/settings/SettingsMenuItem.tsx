import type { ReactNode } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '../../components/ui/button'

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
    <Button
      variant="ghost"
      type="button"
      className="grid h-auto min-h-0 w-full min-w-0 grid-cols-[42px_minmax(0,1fr)_24px] items-center gap-3 rounded-xl px-0 py-4 text-left transition active:scale-[.99]"
      onClick={onClick}>
      <span className="grid size-9 place-items-center rounded-full bg-soft text-ink">{icon}</span>
      <span className="min-w-0">
        <strong className="block text-sm font-semibold">{title}</strong>
        <small className="mt-1 block whitespace-normal text-xs leading-[1.45] text-muted">{description}</small>
      </span>
      <ArrowRight className="text-muted" size={18} />
    </Button>
  )
}
