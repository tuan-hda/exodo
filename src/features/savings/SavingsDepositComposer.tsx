'use client'

import { useState, type FormEvent } from 'react'
import { Check, X } from '@phosphor-icons/react'
import { ComposerHeader } from '@/components/ComposerHeader'
import { ComposerFooter } from '@/components/ComposerFooter'
import { ExpressionAmountField } from '@/components/ExpressionAmountField'
import { IconTile } from '@/components/IconTile'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { evaluateExpression } from '@/lib/amount'
import { SavingsIcon, savingsIconTone } from './savings-icons'
import type { SavingsGoal } from './types'
import { useMediaQuery } from '@/hooks/use-media-query'
import { mediaQueries } from '@/lib/breakpoints'
import { formatMoney } from '@/lib/money'

export function SavingsDepositComposer({
  goal,
  isSaving,
  persistenceError,
  onClose,
  onSave,
}: {
  goal: SavingsGoal
  isSaving: boolean
  persistenceError?: string
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
        <ComposerHeader title="Add contribution" accessibleTitle={`Add contribution to ${goal.name}`}>
          <Button
            variant="outline"
            size="icon-lg"
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Close">
            <X size={19} />
          </Button>
        </ComposerHeader>
        <div className="mb-5 flex items-center gap-3 border-b border-line pb-4">
          <IconTile size="md" shape="input" tone={savingsIconTone(goal.icon)} aria-hidden="true" className="text-lg">
            <SavingsIcon name={goal.icon} size={20} />
          </IconTile>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{goal.name}</p>
            <p className="text-xs text-muted">Target {formatMoney(goal.targetAmount)}</p>
          </div>
        </div>
        <form className="grid gap-4 max-md:flex max-md:min-w-0 max-md:flex-1 max-md:flex-col" onSubmit={submit}>
          <ExpressionAmountField
            amount={amount}
            disabled={isSaving}
            error={error || persistenceError}
            errorId="savings-deposit-amount-error"
            isMobile={isMobile}
            onAmountChange={setAmount}
            onClearError={() => setError('')}
            inputId="savings-deposit-amount"
          />
          <Field>
            <FieldLabel htmlFor="savings-deposit-note" hint="optional">
              Note
            </FieldLabel>
            <Input
              id="savings-deposit-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note"
              disabled={isSaving}
            />
          </Field>
          <ComposerFooter>
            <Button className="w-full gap-2" disabled={isSaving} type="submit" variant="income-primary">
              {isSaving ? 'Saving…' : 'Save'} <Check size={17} />
            </Button>
          </ComposerFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
