'use client'

import { useState } from 'react'
import { Backspace } from '@phosphor-icons/react'
import { evaluateExpression, formatAmountExpression } from '../lib/entry-utils'

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
    <div className="calculator-keypad" aria-label="Amount calculator">
      <div className="calculator-display">{formatAmountExpression(amount || '0')}</div>
      <div className="calculator-keys">
        {['1', '2', '3', '÷', '4', '5', '6', '×', '7', '8', '9', '−', '0', '000', '⌫', '+', '='].map((key) => (
          <button
            key={key}
            disabled={disabled}
            type="button"
            className={`calculator-key ${['÷', '×', '−', '+'].includes(key) ? 'operator' : ''} ${key === '⌫' ? 'utility' : ''} ${key === '=' ? 'equals' : ''}`}
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
      {error && <p className="form-error calculator-error">{error}</p>}
    </div>
  )
}
