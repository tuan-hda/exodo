import type { ReactNode } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { Button } from '@/components/ui/button'

const actionRowClassName =
  'relative z-10 mt-2 flex items-start gap-2.5 border-t border-line bg-surface pt-3 max-md:sticky max-md:bottom-0 max-md:-mx-5 max-md:mt-auto max-md:px-5 max-md:pt-4'

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
    <div className={clsx(actionRowClassName, fullWidthBack ? 'justify-start' : 'justify-between')}>
      <Button
        className={clsx('flex-1 gap-2 text-sm font-semibold text-muted', fullWidthBack && 'w-full')}
        disabled={disabled}
        type="button"
        variant="outline"
        onClick={onBack}>
        <ArrowLeft size={17} /> Back
      </Button>
      {children}
    </div>
  )
}
