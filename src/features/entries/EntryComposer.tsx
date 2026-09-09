'use client'

import { useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, Check, Trash, X } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { Button } from '@/components/ui/button'
import { FadeContent } from '@/components/ui/fade-content'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { defaultCategory, type Category } from './CategoryPicker'
import { ComposerAmountStep } from './ComposerAmountStep'
import { ComposerCategoryStep } from './ComposerCategoryStep'
import { ComposerReviewStep } from './ComposerReviewStep'
import { evaluateExpression, formatAmountExpression } from './entry-utils'
import type { Entry, EntryType } from './types'
import { getCurrentTime, todayKey } from '@/lib/date'
import { useMediaQuery } from '@/hooks/use-media-query'
import { mediaQueries } from '@/lib/breakpoints'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type ComposerStep = 1 | 2 | 3

export function EntryComposer({
  entry,
  type,
  isSaving,
  dayKey = todayKey,
  onClose,
  onSave,
  onTypeChange,
  onDelete,
}: {
  entry?: Entry
  type: EntryType
  isSaving: boolean
  dayKey?: string
  onClose: () => void
  onSave: (entry: Entry) => Promise<boolean>
  onTypeChange: (type: EntryType) => void
  onDelete?: () => Promise<void>
}) {
  const [step, setStep] = useState<ComposerStep>(1)
  const [amount, setAmount] = useState(entry ? formatAmountExpression(String(entry.amount)) : '')
  const [occurredAt, setOccurredAt] = useState(entry?.occurredAt ?? `${dayKey}T${getCurrentTime()}`)
  const [title, setTitle] = useState(entry?.title ?? '')
  const [category, setCategory] = useState<Category>(entry?.category ?? defaultCategory(type))
  const [error, setError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isMobile = useMediaQuery(mediaQueries.mobile)

  function validateAmount() {
    try {
      const numeric = evaluateExpression(amount)
      if (!numeric || numeric <= 0) throw new Error('Enter an amount greater than zero.')
      return numeric
    } catch (calculationError) {
      setError(calculationError instanceof Error ? calculationError.message : 'Enter a valid calculation.')
      return null
    }
  }

  function nextStep() {
    setError('')
    if (step === 2 && validateAmount() !== null) setStep(3)
  }

  function previousStep() {
    setError('')
    setStep((current) => Math.max(1, current - 1) as ComposerStep)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const numeric = validateAmount()
    if (numeric === null) return
    await onSave({
      id: entry?.id ?? `${type}-${Date.now()}`,
      type,
      amount: numeric,
      occurredAt,
      title: title.trim(),
      category,
    })
  }

  function toggleType() {
    const nextType = type === 'income' ? 'expense' : 'income'
    setCategory(defaultCategory(nextType))
    setStep(1)
    setError('')
    onTypeChange(nextType)
  }

  async function handleDelete() {
    if (!onDelete) return
    await onDelete()
    setDeleteOpen(false)
    onClose()
  }

  const stepLabels = ['Category', 'Amount', 'Review']

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose()
      }}>
      <SheetContent side="bottom" variant="composer" showCloseButton={false} aria-busy={isSaving}>
        <SheetTitle className="sr-only">{entry ? `Edit ${type}` : type === 'income' ? 'Income' : 'Expense'}</SheetTitle>
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />
        <div className="mb-7 flex justify-between max-md:mb-5">
          <h2 id="composer-title" className="ui-dialog-title m-0">
            {entry ? `Edit ${type}` : type === 'income' ? 'Income' : 'Expense'}
          </h2>
          <div className="flex items-center gap-2">
            {entry && onDelete && (
              <Button
                variant="outline-danger"
                size="icon-lg"
                type="button"
                disabled={isSaving}
                onClick={() => setDeleteOpen(true)}
                aria-label="Delete transaction">
                <Trash size={18} />
              </Button>
            )}
            <Button
              variant={type === 'income' ? 'secondary' : 'outline'}
              size="sm"
              className={clsx('ui-label tracking-[.06em] max-md:text-[11px]', type === 'income' && 'text-success')}
              type="button"
              disabled={isSaving}
              onClick={toggleType}
              aria-label={`Switch to ${type === 'income' ? 'expense' : 'income'}`}>
              {type === 'income' ? <ArrowDown size={14} weight="bold" /> : <ArrowUp size={14} weight="bold" />}
              {type === 'income' ? 'Income' : 'Expense'}
            </Button>
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
        </div>
        <div className="mb-5 grid grid-cols-3 gap-2 border-b border-line pb-4 max-md:mb-2" aria-label="Record steps">
          {stepLabels.map((label, index) => (
            <span
              className={clsx(
                'ui-meta inline-flex items-center gap-1.5 max-md:text-[9px]',
                step === index + 1 && 'text-ink',
              )}
              key={label}>
              <i
                className={clsx(
                  'grid size-5 shrink-0 place-items-center rounded-full border border-line-strong bg-surface not-italic',
                  step > index + 1 && 'border-ink text-ink',
                  step === index + 1 && 'border-ink bg-surface text-ink',
                )}>
                {step > index + 1 ? <Check size={11} weight="bold" /> : index + 1}
              </i>
              {label}
            </span>
          ))}
        </div>
        <form
          className="grid gap-3 max-md:flex max-md:min-w-0 max-md:flex-1 max-md:flex-col max-md:gap-4"
          onSubmit={submit}>
          {step === 1 && (
            <FadeContent>
              <ComposerCategoryStep
                type={type}
                category={category}
                disabled={isSaving}
                onChange={(selectedCategory) => {
                  setCategory(selectedCategory)
                  setError('')
                  setStep(2)
                }}
              />
            </FadeContent>
          )}
          {step === 2 && (
            <FadeContent>
              <ComposerAmountStep
                amount={amount}
                disabled={isSaving}
                error={error}
                isMobile={isMobile}
                onAmountChange={setAmount}
                onClearError={() => setError('')}
                onNext={nextStep}
                onBack={previousStep}
              />
            </FadeContent>
          )}
          {step === 3 && (
            <FadeContent>
              <ComposerReviewStep
                entry={entry}
                type={type}
                amount={amount}
                title={title}
                occurredAt={occurredAt}
                disabled={isSaving}
                isSaving={isSaving}
                error={error}
                category={category}
                onTitleChange={setTitle}
                onOccurredAtChange={setOccurredAt}
                onBack={previousStep}
              />
            </FadeContent>
          )}
        </form>
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
              <AlertDialogDescription>This transaction will be permanently removed.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => void handleDelete()}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  )
}
