'use client'

import { useState, type FormEvent } from 'react'
import { Check, X } from '@phosphor-icons/react'
import { ComposerFooter } from '@/components/ComposerFooter'
import { StateMessage } from '@/components/StateMessage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { CalculatorKeypad } from '@/features/entries/CalculatorKeypad'
import { evaluateExpression, formatAmountExpression } from '@/features/entries/entry-utils'
import { SavingsIcon } from './savings-icons'
import type { SavingsGoal } from './types'
import { useMediaQuery } from '@/hooks/use-media-query'
import { mediaQueries } from '@/lib/breakpoints'
import { formatMoney } from '@/lib/money'

export function SavingsDepositComposer({
  goal,
  isSaving,
  onClose,
  onSave,
}: {
  goal: SavingsGoal
  isSaving: boolean
  onClose: () => void
  onSave: (amount: number, note: string) => Promise<boolean>
}) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const isMobile = useMediaQuery(mediaQueries.mobile)
  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      const numeric = evaluateExpression(amount)
      if (!numeric || numeric <= 0) throw new Error('Enter an amount greater than zero.')
      if (await onSave(numeric, note.trim())) onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Enter a valid amount.')
    }
  }
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose()
      }}>
      <SheetContent side="bottom" variant="composer" showCloseButton={false} aria-busy={isSaving}>
        <SheetTitle className="sr-only">Add contribution to {goal.name}</SheetTitle>
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />
        <div className="mb-7 flex justify-between max-md:mb-5">
          <h2 className="ui-dialog-title m-0">Add contribution</h2>
          <Button
            variant="outline"
            size="icon-lg"
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Close">
            <X size={19} />
          </Button>
        </div>
        <div className="mb-5 flex items-center gap-3 border-b border-line pb-4">
          <span className="ui-icon-tile-inverse size-10 rounded-input text-lg" aria-hidden="true">
            <SavingsIcon name={goal.icon} size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{goal.name}</p>
            <p className="text-xs text-muted">Target {formatMoney(goal.targetAmount)}</p>
          </div>
        </div>
        <form className="grid gap-4 max-md:flex max-md:min-w-0 max-md:flex-1 max-md:flex-col" onSubmit={submit}>
          <label className="ui-field">
            Amount
            <Input
              autoFocus={!isMobile}
              className="w-full max-md:hidden"
              disabled={isSaving}
              inputMode="decimal"
              value={amount}
              onChange={(event) => {
                setError('')
                setAmount(formatAmountExpression(event.target.value))
              }}
              placeholder="0 or 1200 + 350"
            />
          </label>
          <CalculatorKeypad
            amount={amount}
            disabled={isSaving}
            onChange={(value) => {
              setError('')
              setAmount(value)
            }}
          />
          <label className="ui-field">
            Note{' '}
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note"
              disabled={isSaving}
            />
          </label>
          {error && <StateMessage tone="danger">{error}</StateMessage>}
          <ComposerFooter>
            <Button className="w-full gap-2" disabled={isSaving} type="submit">
              {isSaving ? 'Saving…' : 'Save'} <Check size={17} />
            </Button>
          </ComposerFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
