import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { ComposerStepActions } from './ComposerStepActions'
import { ExpressionAmountField } from '@/components/ExpressionAmountField'

export function ComposerAmountStep({
  amount,
  disabled,
  error,
  isMobile,
  onAmountChange,
  onClearError,
  onNext,
  onBack,
}: {
  amount: string
  disabled: boolean
  error: string
  isMobile: boolean
  onAmountChange: (amount: string) => void
  onClearError: () => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <section className="grid content-start gap-4" aria-label="Enter amount">
      <ExpressionAmountField
        amount={amount}
        disabled={disabled}
        error={error}
        isMobile={isMobile}
        onAmountChange={onAmountChange}
        onClearError={onClearError}
        onEnter={onNext}
        errorId="entry-amount-error"
        inputId="entry-amount"
      />
      <ComposerStepActions disabled={disabled} onBack={onBack}>
        <Button className="flex-1 gap-2" disabled={disabled} type="button" variant="default" onClick={onNext}>
          Continue <ArrowRight size={17} />
        </Button>
      </ComposerStepActions>
    </section>
  )
}
