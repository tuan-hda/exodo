import type { ReactNode } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { ComposerFooter } from '@/components/ComposerFooter'
import { Button } from '@/components/ui/button'

export function ComposerStepActions({
  children,
  fullWidthBack = false,
  onBack,
  disabled,
}: {
  children?: ReactNode
  fullWidthBack?: boolean
  onBack: () => void
  disabled: boolean
}) {
  return (
    <ComposerFooter className={clsx(fullWidthBack ? 'justify-start' : 'justify-between')}>
      <Button
        className={clsx('flex-1 gap-2 text-sm font-semibold text-muted', fullWidthBack && 'w-full')}
        disabled={disabled}
        type="button"
        variant="outline"
        onClick={onBack}>
        <ArrowLeft size={17} /> Back
      </Button>
      {children}
    </ComposerFooter>
  )
}
