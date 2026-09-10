'use client'

import { CalculatorKeypad } from './CalculatorKeypad'
import { StateMessage } from './StateMessage'
import { Field, FieldLabel } from './ui/field'
import { Input } from './ui/input'
import { formatAmountExpression } from '@/lib/amount'

export function ExpressionAmountField({
  amount,
  disabled,
  error,
  isMobile,
  onAmountChange,
  onClearError,
  onEnter,
  errorId = 'amount-field-error',
  inputId = 'amount-field',
}: {
  amount: string
  disabled: boolean
  error?: string
  isMobile: boolean
  onAmountChange: (amount: string) => void
  onClearError: () => void
  onEnter?: () => void
  errorId?: string
  inputId?: string
}) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor={inputId}>Amount</FieldLabel>
        <Input
          id={inputId}
          autoFocus={!isMobile}
          className="w-full max-md:hidden"
          disabled={disabled}
          readOnly={isMobile}
          inputMode="decimal"
          value={amount}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            onClearError()
            onAmountChange(formatAmountExpression(event.target.value))
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && onEnter) {
              event.preventDefault()
              onEnter()
            }
          }}
          onBlur={() => onAmountChange(formatAmountExpression(amount))}
          placeholder="0 or 1200 + 350"
        />
      </Field>
      <CalculatorKeypad
        amount={amount}
        disabled={disabled}
        onChange={(value) => {
          onClearError()
          onAmountChange(value)
        }}
      />
      {error && (
        <StateMessage id={errorId} tone="danger">
          {error}
        </StateMessage>
      )}
    </>
  )
}
