'use client'

import { useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, Check, Trash, X } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { Button } from '@/components/ui/button'
import { ComposerHeader } from '@/components/ComposerHeader'
import { FadeContent } from '@/components/ui/fade-content'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { StateMessage } from '@/components/StateMessage'
import { defaultCategory, type Category } from '@/features/finance/category'
import { ComposerAmountStep } from './ComposerAmountStep'
import { ComposerCategoryStep } from './ComposerCategoryStep'
import { ComposerReviewStep } from './ComposerReviewStep'
import type { Entry, EntryType } from './types'
import { evaluateExpression, formatAmountExpression } from '@/lib/amount'
import { getCurrentTime, getDayKey } from '@/lib/date'
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
  dayKey = getDayKey(),
  onClose,
  onSave,
  onTypeChange,
  onDelete,
  persistenceError,
}: {
  entry?: Entry
  type: EntryType
  isSaving: boolean
  dayKey?: string
  onClose: () => void
  onSave: (entry: Entry) => Promise<boolean>
  onTypeChange: (type: EntryType) => void
  onDelete?: () => Promise<boolean>
  persistenceError?: string
}) {
  const [step, setStep] = useState<ComposerStep>(1)
  const [amount, setAmount] = useState(entry ? formatAmountExpression(String(entry.amount)) : '')
  const [occurredAt, setOccurredAt] = useState(entry?.occurredAt ?? `${dayKey}T${getCurrentTime()}`)
  const [title, setTitle] = useState(entry?.title ?? '')
  const [category, setCategory] = useState<Category>(entry?.category ?? defaultCategory(type))
  const [error, setError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const isMobile = useMediaQuery(mediaQueries.mobile)
  const isBusy = isSaving || isDeleting
  const composerAccent =
    type === 'income'
      ? {
          border: 'border-success/50',
          soft: 'bg-success-soft',
          solid: 'bg-success',
          text: 'text-success',
        }
      : {
          border: 'border-category-coral/50',
          soft: 'bg-category-coral-soft',
          solid: 'bg-category-coral',
          text: 'text-category-coral',
        }

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
    setStep((current) => (current === 3 ? 2 : 1))
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
    if (!onDelete || isDeleting) return
    setIsDeleting(true)
    try {
      if (await onDelete()) {
        setDeleteOpen(false)
        onClose()
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const stepLabels = ['Category', 'Amount', 'Review']

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open && !isBusy) onClose()
      }}>
      <SheetContent side="bottom" variant="composer" showCloseButton={false} aria-busy={isBusy}>
        <ComposerHeader title={entry ? `Edit ${type}` : type === 'income' ? 'Income' : 'Expense'} accent={type}>
          {entry && onDelete && (
            <Button
              variant="outline-danger"
              size="icon-lg"
              type="button"
              disabled={isBusy}
              onClick={() => setDeleteOpen(true)}
              aria-label="Delete transaction">
              <Trash size={18} />
            </Button>
          )}
          <Button
            variant={type === 'income' ? 'income' : 'expense'}
            size="meta"
            type="button"
            disabled={isBusy}
            onClick={toggleType}
            aria-label={`Switch to ${type === 'income' ? 'expense' : 'income'}`}>
            {type === 'income' ? <ArrowDown size={14} weight="bold" /> : <ArrowUp size={14} weight="bold" />}
            {type === 'income' ? 'Income' : 'Expense'}
          </Button>
          <Button variant="outline" size="icon-lg" type="button" disabled={isBusy} onClick={onClose} aria-label="Close">
            <X size={19} />
          </Button>
        </ComposerHeader>
        <div
          className="mb-5 grid grid-cols-3 gap-2 border-b border-line pb-4 max-md:mb-2"
          role="group"
          aria-label="Record steps">
          {stepLabels.map((label, index) => {
            const isComplete = step > index + 1
            const isCurrent = step === index + 1

            return (
              <span
                className={clsx(
                  'ui-meta inline-flex items-center gap-1.5 max-md:text-[9px]',
                  isCurrent && composerAccent.text,
                )}
                key={label}>
                <i
                  className={clsx(
                    'grid size-5 shrink-0 place-items-center rounded-full border not-italic',
                    !isComplete && !isCurrent && 'border-line-strong bg-surface',
                    isComplete && `${composerAccent.border} ${composerAccent.solid} text-white`,
                    isCurrent && `${composerAccent.border} ${composerAccent.soft} ${composerAccent.text}`,
                  )}>
                  {isComplete ? <Check size={11} weight="bold" /> : index + 1}
                </i>
                {label}
              </span>
            )
          })}
        </div>
        <form
          className="grid gap-3 max-md:flex max-md:min-w-0 max-md:flex-1 max-md:flex-col max-md:gap-4"
          onSubmit={submit}>
          {step === 1 && (
            <FadeContent>
              <ComposerCategoryStep
                type={type}
                category={category}
                disabled={isBusy}
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
                type={type}
                disabled={isBusy}
                error={error || persistenceError || ''}
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
                disabled={isBusy}
                isSaving={isSaving}
                error={error || persistenceError || ''}
                category={category}
                onTitleChange={setTitle}
                onOccurredAtChange={setOccurredAt}
                onBack={previousStep}
              />
            </FadeContent>
          )}
        </form>
        <AlertDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            if (!isBusy) setDeleteOpen(open)
          }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
              <AlertDialogDescription>This transaction will be permanently removed.</AlertDialogDescription>
            </AlertDialogHeader>
            {persistenceError && <StateMessage tone="danger">{persistenceError}</StateMessage>}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isBusy}
                onClick={(event) => {
                  event.preventDefault()
                  void handleDelete()
                }}>
                {isDeleting ? 'Deleting…' : 'Delete transaction'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  )
}
