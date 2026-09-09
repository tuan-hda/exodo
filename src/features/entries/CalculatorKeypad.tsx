'use client'

import { Backspace } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { Button } from '@/components/ui/button'
import { formatAmountExpression } from './entry-utils'

export function CalculatorKeypad({
  amount,
  disabled,
  onChange,
}: {
  amount: string
  disabled: boolean
  onChange: (amount: string) => void
}) {
  function append(value: string) {
    onChange(`${amount}${value}`)
  }

  function backspace() {
    onChange(amount.slice(0, -1))
  }

  function pressKey(key: string) {
    if (key === '⌫') backspace()
    else append(key === '−' ? '-' : key)
  }

  return (
    <div className="hidden max-md:block" role="group" aria-label="Amount calculator">
      <div className="ui-expression rounded-control border border-line-strong bg-soft px-3 py-3 text-right">
        {formatAmountExpression(amount || '0')}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {['1', '2', '3', '÷', '4', '5', '6', '×', '7', '8', '9', '−', '0', '000', '⌫', '+'].map((key) => (
          <Button
            key={key}
            disabled={disabled}
            type="button"
            variant="keypad"
            size="keypad"
            aria-label={key === '⌫' ? 'Delete last character' : key}
            className={clsx(
              ['÷', '×', '−', '+'].includes(key) && 'border-line-strong',
              key === '⌫' ? 'bg-surface text-muted hover:bg-soft' : 'bg-soft text-ink hover:bg-line',
            )}
            onClick={() => pressKey(key)}>
            {key === '⌫' ? <Backspace size={21} weight="regular" /> : key}
          </Button>
        ))}
      </div>
    </div>
  )
}
