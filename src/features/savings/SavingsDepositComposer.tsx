'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Check, X } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { Sheet, SheetContent, SheetTitle } from '../../components/ui/sheet'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { CalculatorKeypad } from '../entries/CalculatorKeypad'
import { evaluateExpression, formatAmountExpression } from '../entries/entry-utils'
import type { SavingsGoal } from './types'

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
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
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
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className={clsx(
          'max-h-[calc(100dvh-24px)] w-[min(560px,100%)] overflow-y-auto overscroll-contain rounded-t-[28px] border border-line-strong bg-white p-[26px] text-ink shadow-[0_20px_70px_rgb(21_21_21_/_0.12)] [margin-inline:auto] [padding-top:max(16px,env(safe-area-inset-top))] [padding-bottom:max(16px,env(safe-area-inset-bottom))] max-[700px]:flex max-[700px]:min-h-0 max-[700px]:max-h-[calc(100dvh-env(safe-area-inset-top)-12px)] max-[700px]:w-full max-[700px]:min-w-0 max-[700px]:overflow-x-hidden max-[700px]:rounded-t-[28px] max-[700px]:rounded-b-none max-[700px]:border-0 max-[700px]:p-5 max-[700px]:[margin-inline:0]',
        )}
        aria-busy={isSaving}>
        <SheetTitle className="sr-only">Add contribution to {goal.name}</SheetTitle>
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />
        <div className="mb-7 flex justify-between max-[700px]:mb-5">
          <h2>Add contribution</h2>
          <Button
            variant="outline"
            size="icon-lg"
            className="size-10 rounded-xl p-0 text-ink"
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Close">
            <X size={19} />
          </Button>
        </div>
        <div className="mb-5 flex items-center gap-3 border-b border-line pb-4">
          <span className="grid size-10 place-items-center rounded-xl bg-ink text-lg" aria-hidden="true">
            {goal.icon || '✈️'}
          </span>
          <div>
            <p className="text-sm font-semibold">{goal.name}</p>
            <p className="text-xs text-muted">
              Target {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(goal.targetAmount)} ₫
            </p>
          </div>
        </div>
        <form
          className="grid gap-4 max-[700px]:flex max-[700px]:min-w-0 max-[700px]:flex-1 max-[700px]:flex-col"
          onSubmit={submit}>
          <label className="grid min-w-0 gap-1.5 text-[11px] font-bold text-muted max-[700px]:text-xs">
            Amount
            <Input
              autoFocus={!isMobile}
              className="h-11 min-w-0 max-w-full w-full rounded-[14px] border border-line-strong bg-white px-3 py-2 text-base text-ink outline-0 transition focus:border-ink max-[700px]:hidden"
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
          <label className="grid min-w-0 gap-1.5 text-[11px] font-bold text-muted max-[700px]:text-xs">
            Note{' '}
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note"
              disabled={isSaving}
            />
          </label>
          {error && (
            <p
              className="m-0 rounded-[14px] border border-line-strong bg-soft px-3 py-[11px] text-[11px] leading-[1.55] text-danger"
              role="alert">
              {error}
            </p>
          )}
          <div className="relative z-[1] mt-2 flex items-start border-t border-line bg-white pt-3 max-[700px]:sticky max-[700px]:bottom-0 max-[700px]:-mx-5 max-[700px]:mt-auto max-[700px]:px-5 max-[700px]:pt-4">
            <Button className="h-10 min-h-10 w-full gap-2 px-4 text-sm font-bold" disabled={isSaving} type="submit">
              {isSaving ? 'Saving…' : 'Save'} <Check size={17} />
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
