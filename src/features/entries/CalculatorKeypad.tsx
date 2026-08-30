'use client'

import { useState } from 'react'
import { Backspace } from '@phosphor-icons/react'
import { evaluateExpression, formatAmountExpression } from './entry-utils'

export function CalculatorKeypad({
  amount,
  disabled,
  onChange,
  onComplete,
}: {
  amount: string
  disabled: boolean
  onChange: (amount: string) => void
  onComplete?: () => void
}) {
  const [error, setError] = useState('')

  function append(value: string) {
    setError('')
    onChange(`${amount}${value}`)
  }

  function calculate() {
    try {
      onChange(String(evaluateExpression(amount)))
      setError('')
      onComplete?.()
    } catch (calculationError) {
      setError(calculationError instanceof Error ? calculationError.message : 'Enter a valid calculation.')
    }
  }

  function backspace() {
    onChange(amount.slice(0, -1))
    setError('')
  }

  return (
    <div className="hidden max-[700px]:block" aria-label="Amount calculator">
      <div className="rounded-[14px] border border-line-strong bg-soft px-3 py-3 text-right font-mono text-[20px] text-ink [overflow-wrap:anywhere]">
        {formatAmountExpression(amount || '0')}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {['1', '2', '3', '÷', '4', '5', '6', '×', '7', '8', '9', '−', '0', '000', '⌫', '+', '='].map((key) => (
          <button
            key={key}
            disabled={disabled}
            type="button"
            className={
              key === '='
                ? 'col-span-full inline-flex min-h-[52px] items-center justify-center rounded-xl border border-ink bg-ink font-mono text-base text-white transition active:scale-[.97] disabled:cursor-wait disabled:opacity-50 max-[700px]:min-h-[58px]'
                : `inline-flex min-h-[52px] items-center justify-center rounded-xl border ${['÷', '×', '−', '+'].includes(key) ? 'border-line-strong' : 'border-line'} ${key === '⌫' ? 'bg-white text-muted' : 'bg-soft text-ink'} font-mono text-base transition hover:border-line-strong active:scale-[.97] disabled:cursor-wait disabled:opacity-50 max-[700px]:min-h-[58px]`
            }
            aria-label={key === '⌫' ? 'Delete last character' : key}
            onClick={() => {
              if (key === '⌫') backspace()
              else if (key === '=') calculate()
              else append(key === '−' ? '-' : key)
            }}>
            {key === '⌫' ? <Backspace size={21} weight="regular" /> : key}
          </button>
        ))}
      </div>
      {error && (
        <div
          className="mt-3 rounded-[14px] border border-line-strong bg-soft px-3 py-[11px] text-[11px] leading-[1.55] text-danger"
          role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
