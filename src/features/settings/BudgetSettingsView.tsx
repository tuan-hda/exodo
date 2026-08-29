'use client'

import { useState } from 'react'
import { ArrowLeft, Trash } from '@phosphor-icons/react'
import { useUser } from '@clerk/nextjs'
import { categoryClass, categoryIcon, expenseCategories } from '../entries/CategoryPicker'
import { formatMoneyInput, formatShort } from '../entries/entry-utils'
import { useBudgets } from '../budgets/use-budgets'

export function BudgetSettingsView({ onBack }: { onBack: () => void }) {
  const { user } = useUser()
  const [category, setCategory] = useState(expenseCategories[0])
  const [amount, setAmount] = useState('')
  const { budgets, isLoading, isSaving, error, saveBudget, removeBudget } = useBudgets(user?.id)
  const currentBudget = budgets.find((budget) => budget.category === category)

  async function handleSave() {
    const value = Number(amount.replace(/,/g, ''))
    if (await saveBudget(category, value)) setAmount('')
  }

  return (
    <section className="settings-view budget-settings-view">
      <button className="settings-back" type="button" onClick={onBack}>
        <ArrowLeft size={17} /> Settings
      </button>
      <div className="settings-page-heading">
        <p className="eyebrow">recurring controls</p>
        <h1>Budget settings</h1>
        <p>These limits apply automatically to every month.</p>
      </div>
      <div className="budget-category-picker">
        {expenseCategories.map((item) => (
          <button
            key={item}
            type="button"
            className={`budget-category-option ${category === item ? 'selected' : ''}`}
            onClick={() => setCategory(item)}>
            <span className={categoryClass(item)}>{categoryIcon(item, 16)}</span>
            {item}
          </button>
        ))}
      </div>
      <div className="budget-form">
        <label htmlFor="budget-amount">Monthly limit for {category}</label>
        <div className="budget-input-row">
          <input
            id="budget-amount"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(formatMoneyInput(event.target.value))}
            placeholder={currentBudget ? Number(currentBudget.amount).toLocaleString('en-US') : '0'}
          />
          <button className="submit-record" type="button" onClick={handleSave} disabled={isSaving || !amount.trim()}>
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      {isLoading && <p className="settings-muted">Loading budgets…</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {budgets.length > 0 && (
        <div className="configured-budgets">
          <p className="settings-muted">Recurring budgets</p>
          {budgets.map((budget) => (
            <div className="configured-budget" key={budget.id}>
              <span>
                <span className={`activity-icon ${categoryClass(budget.category)}`}>
                  {categoryIcon(budget.category, 16)}
                </span>
                {budget.category}
              </span>
              <strong>{formatShort(budget.amount)}</strong>
              <button
                type="button"
                aria-label={`Remove ${budget.category} budget`}
                onClick={() => removeBudget(budget)}>
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
