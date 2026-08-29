'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, Check, CircleNotch, X } from '@phosphor-icons/react'
import { CategoryPicker, defaultCategory, type Category } from './CategoryPicker'
import { CalculatorKeypad } from './CalculatorKeypad'
import { Sheet, SheetContent, SheetTitle } from '../../components/ui/sheet'
import { Button } from '../../components/ui/button'
import { evaluateExpression, formatAmountExpression, formatMoney, getCurrentTime, todayKey } from './entry-utils'
import type { Entry, EntryType } from './types'

type ComposerStep = 1 | 2 | 3

export function EntryComposer({
  entry,
  type,
  isSaving,
  dayKey = todayKey,
  onClose,
  onSave,
  onTypeChange,
}: {
  entry?: Entry
  type: EntryType
  isSaving: boolean
  dayKey?: string
  onClose: () => void
  onSave: (entry: Entry) => Promise<boolean>
  onTypeChange: (type: EntryType) => void
}) {
  const [step, setStep] = useState<ComposerStep>(1)
  const [amount, setAmount] = useState(entry ? formatAmountExpression(String(entry.amount)) : '')
  const [occurredAt, setOccurredAt] = useState(entry?.occurredAt ?? `${dayKey}T${getCurrentTime()}`)
  const [title, setTitle] = useState(entry?.title ?? '')
  const [category, setCategory] = useState<Category>(entry?.category ?? defaultCategory(type))
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

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

  const stepLabels = ['Category', 'Amount', 'Review']

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose()
      }}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className={`composer sheet-safe-area ${type}`}
        aria-busy={isSaving}>
        <SheetTitle className="sr-only">{entry ? `Edit ${type}` : type === 'income' ? 'Income' : 'Expense'}</SheetTitle>
        <div className="sheet-handle" aria-hidden="true" />
        <div className="composer-heading">
          <h2 id="composer-title">{entry ? `Edit ${type}` : type === 'income' ? 'Income' : 'Expense'}</h2>
          <div className="composer-actions">
            <button
              className="composer-type-indicator"
              type="button"
              disabled={isSaving}
              onClick={toggleType}
              aria-label={`Switch to ${type === 'income' ? 'expense' : 'income'}`}>
              {type === 'income' ? <ArrowDown size={14} weight="bold" /> : <ArrowUp size={14} weight="bold" />}
              {type === 'income' ? 'Income' : 'Expense'}
            </button>
            <button className="close-composer" type="button" disabled={isSaving} onClick={onClose} aria-label="Close">
              <X size={19} />
            </button>
          </div>
        </div>
        <div className="composer-progress" aria-label="Record steps">
          {stepLabels.map((label, index) => (
            <span className={step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''} key={label}>
              <i>{step > index + 1 ? <Check size={11} weight="bold" /> : index + 1}</i>
              {label}
            </span>
          ))}
        </div>
        <form onSubmit={submit}>
          {step === 1 && (
            <section className="composer-step" aria-label="Choose category">
              <CategoryPicker
                disabled={isSaving}
                type={type}
                value={category}
                onChange={(selectedCategory) => {
                  setCategory(selectedCategory)
                  setError('')
                  setStep(2)
                }}
              />
            </section>
          )}
          {step === 2 && (
            <section className="composer-step" aria-label="Enter amount">
              <label>
                Amount
                <input
                  className="amount-input"
                  disabled={isSaving}
                  readOnly={isMobile}
                  autoFocus
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => {
                    setError('')
                    setAmount(formatAmountExpression(event.target.value))
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      nextStep()
                    }
                  }}
                  onBlur={() => setAmount(formatAmountExpression(amount))}
                  placeholder="0 or 1200 + 350"
                />
              </label>
              <CalculatorKeypad
                amount={amount}
                disabled={isSaving}
                onChange={(value) => {
                  setAmount(value)
                  setError('')
                }}
                onComplete={nextStep}
              />
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="composer-step-actions">
                <Button
                  className="step-back"
                  disabled={isSaving}
                  type="button"
                  variant="outline"
                  onClick={previousStep}>
                  <ArrowLeft size={17} /> Back
                </Button>
              </div>
            </section>
          )}
          {step === 3 && (
            <section className="composer-step" aria-label="Review record">
              <div className="review-card">
                <div className="review-amount">
                  <span>{type === 'income' ? 'Income' : 'Expense'}</span>
                  <strong>{formatMoney(evaluateExpression(amount))}</strong>
                </div>
                <div className="review-row">
                  <span>Category</span>
                  <strong>{category}</strong>
                </div>
              </div>
              <label>
                Name <span className="optional-label">optional</span>
                <input
                  disabled={isSaving}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={type === 'income' ? 'Salary, bonus...' : 'Coffee, groceries...'}
                />
              </label>
              <label>
                Date and time
                <input
                  disabled={isSaving}
                  type="datetime-local"
                  value={occurredAt}
                  onChange={(event) => setOccurredAt(event.target.value)}
                />
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="composer-step-actions">
                <Button
                  className="step-back"
                  disabled={isSaving}
                  type="button"
                  variant="outline"
                  onClick={previousStep}>
                  <ArrowLeft size={17} /> Back
                </Button>
                <Button className="submit-record" disabled={isSaving} type="submit" variant="default">
                  {isSaving ? (
                    <>
                      <CircleNotch className="loading-spinner" size={17} /> Saving…
                    </>
                  ) : (
                    <>
                      {entry ? 'Save changes' : 'Save record'} <Check size={17} weight="bold" />
                    </>
                  )}
                </Button>
              </div>
            </section>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}
