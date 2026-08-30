import type { ReactNode } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { Button } from '../../components/ui/button'

const actionRowClassName =
  'relative z-[1] mt-2 flex items-start gap-2.5 border-t border-line bg-white pt-3 max-[700px]:sticky max-[700px]:bottom-0 max-[700px]:-mx-5 max-[700px]:mt-auto max-[700px]:px-5 max-[700px]:pt-4'
const backButtonClassName =
  'h-10 min-h-10 gap-2 px-4 text-sm font-bold text-muted hover:border-[#bdbdbd] hover:text-ink'

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
        className={clsx(backButtonClassName, fullWidthBack && 'w-full', 'flex-1')}
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
