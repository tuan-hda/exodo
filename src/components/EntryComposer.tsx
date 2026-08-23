'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, Check, CircleNotch, X } from '@phosphor-icons/react'
import { CategoryPicker, defaultCategory, type Category } from './CategoryPicker'
import { CalculatorKeypad } from './CalculatorKeypad'
import { evaluateExpression, formatAmountExpression, formatMoney, getCurrentTime, todayKey } from '../lib/entry-utils'
import type { Entry, EntryType } from '../types/entry'

type ComposerStep = 1 | 2 | 3

export function EntryComposer({ entry, type, isSaving, dayKey = todayKey, onClose, onSave, onTypeChange }: { entry?: Entry; type: EntryType; isSaving: boolean; dayKey?: string; onClose: () => void; onSave: (entry: Entry) => Promise<boolean>; onTypeChange: (type: EntryType) => void }) {
  const [step, setStep] = useState<ComposerStep>(1)
  const [amount, setAmount] = useState(entry ? String(entry.amount) : '')
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
    setStep(current => Math.max(1, current - 1) as ComposerStep)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const numeric = validateAmount()
    if (numeric === null) return
    await onSave({ id: entry?.id ?? `${type}-${Date.now()}`, type, amount: numeric, occurredAt, title: title.trim(), category })
  }

  function toggleType() {
    const nextType = type === 'income' ? 'expense' : 'income'
    setCategory(defaultCategory(nextType))
    setStep(1)
    setError('')
    onTypeChange(nextType)
  }

  const stepLabels = ['Category', 'Amount', 'Review']

  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && !isSaving && onClose()}><div className={`composer ${type}`} role="dialog" aria-modal="true" aria-labelledby="composer-title" aria-busy={isSaving}><div className="composer-heading"><div><p className="eyebrow">{entry ? 'edit record' : 'new record'}</p><h2 id="composer-title">{entry ? 'Edit record' : type === 'income' ? 'Add income' : 'Add expense'}</h2></div><div className="composer-actions"><button className="composer-type-indicator" type="button" disabled={isSaving} onClick={toggleType} aria-label={`Switch to ${type === 'income' ? 'expense' : 'income'}`}>{type === 'income' ? <ArrowDown size={14} weight="bold" /> : <ArrowUp size={14} weight="bold" />}{type === 'income' ? 'Income' : 'Expense'}</button><button className="close-composer" disabled={isSaving} onClick={onClose} aria-label="Close"><X size={19} /></button></div></div><div className="composer-progress" aria-label="Record steps">{stepLabels.map((label, index) => <span className={step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''} key={label}><i>{step > index + 1 ? <Check size={11} weight="bold" /> : index + 1}</i>{label}</span>)}</div><form onSubmit={submit}>
    {step === 1 && <section className="composer-step" aria-labelledby="step-category-title"><div><p className="eyebrow">step one</p><h3 id="step-category-title">What kind of {type}?</h3><p className="step-copy">Choose the category that best describes this record.</p></div><CategoryPicker disabled={isSaving} type={type} value={category} onChange={selectedCategory => { setCategory(selectedCategory); setError(''); setStep(2) }} /></section>}
    {step === 2 && <section className="composer-step" aria-labelledby="step-amount-title"><div><p className="eyebrow">step two</p><h3 id="step-amount-title">How much?</h3><p className="step-copy">Enter the amount. Tap equals when it is ready.</p></div><label>Amount<input className="amount-input" disabled={isSaving} readOnly={isMobile} autoFocus inputMode="decimal" value={amount} onChange={event => { setError(''); setAmount(formatAmountExpression(event.target.value)) }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); nextStep() } }} onBlur={() => setAmount(formatAmountExpression(amount))} placeholder="0 or 1200 + 350" /></label><CalculatorKeypad amount={amount} disabled={isSaving} onChange={value => { setAmount(value); setError('') }} onComplete={nextStep} />{error && <p className="form-error" role="alert">{error}</p>}<div className="composer-step-actions"><button className="step-back" disabled={isSaving} type="button" onClick={previousStep}><ArrowLeft size={17} /> Back</button></div></section>}
    {step === 3 && <section className="composer-step" aria-labelledby="step-review-title"><div><p className="eyebrow">step three</p><h3 id="step-review-title">Review record</h3><p className="step-copy">Add a name if it helps you find this later.</p></div><div className="review-card"><div className="review-amount"><span>{type === 'income' ? 'Income' : 'Expense'}</span><strong>{formatMoney(evaluateExpression(amount))}</strong></div><div className="review-row"><span>Category</span><strong>{category}</strong></div></div><label>Name <span className="optional-label">optional</span><input disabled={isSaving} value={title} onChange={event => setTitle(event.target.value)} placeholder={type === 'income' ? 'Salary, bonus...' : 'Coffee, groceries...'} /></label><label>Date and time<input disabled={isSaving} type="datetime-local" value={occurredAt} onChange={event => setOccurredAt(event.target.value)} /></label>{type === 'income' && <p className="allocation-note">Income dated on or before the 15th is divided from that date through month end. Later income starts next month.</p>}{error && <p className="form-error" role="alert">{error}</p>}<div className="composer-step-actions"><button className="step-back" disabled={isSaving} type="button" onClick={previousStep}><ArrowLeft size={17} /> Back</button><button className="submit-record" disabled={isSaving} type="submit">{isSaving ? <><CircleNotch className="loading-spinner" size={17} /> Saving…</> : <>{entry ? 'Save changes' : 'Save record'} <Check size={17} weight="bold" /></>}</button></div></section>}
  </form></div></div>
}
