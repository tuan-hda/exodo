'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, CircleNotch, X } from '@phosphor-icons/react'
import { CategoryPicker, defaultCategory, type Category } from './CategoryPicker'
import { CalculatorKeypad } from './CalculatorKeypad'
import { currentTime, evaluateExpression, formatAmountExpression, todayKey } from '../lib/entry-utils'
import type { Entry, EntryType } from '../types/entry'

export function EntryComposer({ entry, type, isSaving, onClose, onSave, onTypeChange }: { entry?: Entry; type: EntryType; isSaving: boolean; onClose: () => void; onSave: (entry: Entry) => Promise<boolean>; onTypeChange: (type: EntryType) => void }) {
  const [amount, setAmount] = useState(entry ? String(entry.amount) : '')
  const [occurredAt, setOccurredAt] = useState(entry?.occurredAt ?? `${todayKey}T${currentTime}`)
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

  async function submit(event: FormEvent) {
    event.preventDefault()
    let numeric: number
    try {
      numeric = evaluateExpression(amount)
    } catch (calculationError) {
      return setError(calculationError instanceof Error ? calculationError.message : 'Enter a valid calculation.')
    }
    if (!numeric || numeric <= 0) return setError('Enter an amount greater than zero.')
    await onSave({ id: entry?.id ?? `${type}-${Date.now()}`, type, amount: numeric, occurredAt, title: title.trim(), category })
  }

  function toggleType() {
    const nextType = type === 'income' ? 'expense' : 'income'
    setCategory(defaultCategory(nextType))
    onTypeChange(nextType)
  }

  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && !isSaving && onClose()}><div className={`composer ${type}`} role="dialog" aria-modal="true" aria-labelledby="composer-title" aria-busy={isSaving}><div className="composer-heading"><div><p className="eyebrow">{entry ? 'edit record' : 'new record'}</p><h2 id="composer-title">{entry ? 'Edit record' : type === 'income' ? 'Add income' : 'Add expense'}</h2></div><div className="composer-actions"><button className="composer-type-indicator" type="button" disabled={isSaving} onClick={toggleType} aria-label={`Switch to ${type === 'income' ? 'expense' : 'income'}`}>{type === 'income' ? <ArrowDown size={14} weight="bold" /> : <ArrowUp size={14} weight="bold" />}{type === 'income' ? 'Income' : 'Expense'}</button><button className="close-composer" disabled={isSaving} onClick={onClose} aria-label="Close"><X size={19} /></button></div></div><form onSubmit={submit}><label>Amount<input className="amount-input" disabled={isSaving} readOnly={isMobile} autoFocus inputMode="decimal" value={amount} onChange={event => setAmount(formatAmountExpression(event.target.value))} onBlur={() => setAmount(formatAmountExpression(amount))} placeholder="0 or 1200 + 350" /></label><CalculatorKeypad amount={amount} disabled={isSaving} onChange={value => { setAmount(value); setError('') }} /><label>Name<input disabled={isSaving} value={title} onChange={event => setTitle(event.target.value)} placeholder={type === 'income' ? 'Salary, freelance...' : 'Coffee, groceries...'} /></label><CategoryPicker disabled={isSaving} type={type} value={category} onChange={setCategory} /><label>Date and time<input disabled={isSaving} type="datetime-local" value={occurredAt} onChange={event => setOccurredAt(event.target.value)} /></label>{type === 'income' && <p className="allocation-note">Income dated on or before the 15th is divided from that date through month end. Later income starts next month.</p>}{error && <p className="form-error">{error}</p>}<div className="composer-submit-actions"><button className="cancel-composer" disabled={isSaving} type="button" onClick={onClose}>Cancel</button><button className="submit-record" disabled={isSaving} type="submit">{isSaving ? <><CircleNotch className="loading-spinner" size={17} /> Saving…</> : <>{entry ? 'Save changes' : 'Save record'} <ArrowUp size={17} /></>}</button></div></form></div></div>
}
