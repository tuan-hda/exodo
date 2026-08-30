import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '../../components/ui/button'
import { CalculatorKeypad } from './CalculatorKeypad'
import { ComposerStepActions } from './ComposerStepActions'
import { formatAmountExpression } from './entry-utils'

const errorClassName =
  'm-0 rounded-[14px] border border-line-strong bg-soft px-3 py-[11px] text-[11px] leading-[1.55] text-danger'

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
      <label className="grid min-w-0 gap-1.5 text-[11px] font-bold text-muted max-[700px]:text-xs">
        Amount
        <input
          className="h-11 min-w-0 max-w-full w-full rounded-[14px] border border-line-strong bg-white px-3 py-2 text-base text-ink outline-0 transition focus:border-ink max-[700px]:hidden"
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
      {error && (
        <p className={errorClassName} role="alert">
          {error}
        </p>
      )}
      <ComposerStepActions disabled={disabled} onBack={onBack}>
        <Button
          className="h-10 min-h-10 flex-1 gap-2 px-4 text-sm font-bold"
          disabled={disabled}
          type="button"
          onClick={onNext}>
          Continue <ArrowRight size={17} />
        </Button>
      </ComposerStepActions>
    </section>
  )
}
