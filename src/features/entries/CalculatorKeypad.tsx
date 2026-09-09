'use client'

import { Backspace } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { triggerHaptic } from '@/lib/haptics'
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
    triggerHaptic()
    if (key === '⌫') backspace()
    else append(key === '−' ? '-' : key)
  }

  return (
    <div className="hidden max-[700px]:block" aria-label="Amount calculator">
      <div className="rounded-[14px] border border-line-strong bg-soft px-3 py-3 text-right font-mono text-[20px] text-ink [overflow-wrap:anywhere]">
        {formatAmountExpression(amount || '0')}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {['1', '2', '3', '÷', '4', '5', '6', '×', '7', '8', '9', '−', '0', '000', '⌫', '+'].map((key) => (
          <button
            key={key}
            disabled={disabled}
            type="button"
            aria-label={key === '⌫' ? 'Delete last character' : key}
            className={clsx(
              'inline-flex min-h-[52px] w-full items-center justify-center rounded-[12px] border font-mono text-base transition-colors active:scale-[.97] disabled:cursor-wait disabled:opacity-50 max-[700px]:min-h-[58px]',
              ['÷', '×', '−', '+'].includes(key) ? 'border-line-strong' : 'border-line',
              key === '⌫' ? 'bg-surface text-muted hover:bg-soft' : 'bg-soft text-ink hover:bg-line',
            )}
            onClick={() => pressKey(key)}>
            {key === '⌫' ? <Backspace size={21} weight="regular" /> : key}
          </button>
        ))}
      </div>
    </div>
  )
}
