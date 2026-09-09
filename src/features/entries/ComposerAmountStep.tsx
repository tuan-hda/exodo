import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StateMessage } from '@/components/StateMessage'
import { CalculatorKeypad } from './CalculatorKeypad'
import { ComposerStepActions } from './ComposerStepActions'
import { formatAmountExpression } from './entry-utils'

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
      <label className="ui-field">
        Amount
        <Input
          className="max-md:hidden"
          disabled={disabled}
          readOnly={isMobile}
          autoFocus
          inputMode="decimal"
          value={amount}
          onChange={(event) => {
            onClearError()
            onAmountChange(formatAmountExpression(event.target.value))
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onNext()
            }
          }}
          onBlur={() => onAmountChange(formatAmountExpression(amount))}
          placeholder="0 or 1200 + 350"
        />
      </label>
      <CalculatorKeypad
        amount={amount}
        disabled={disabled}
        onChange={(value) => {
          onAmountChange(value)
          onClearError()
        }}
      />
      {error && <StateMessage tone="danger">{error}</StateMessage>}
      <ComposerStepActions disabled={disabled} onBack={onBack}>
        <Button className="flex-1 gap-2 text-sm font-semibold" disabled={disabled} type="button" onClick={onNext}>
          Continue <ArrowRight size={17} />
        </Button>
      </ComposerStepActions>
    </section>
  )
}
