'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, Trash } from '@phosphor-icons/react'
import { useUser } from '@clerk/nextjs'
import { Button } from '../../components/ui/button'
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
    <section className="mx-auto max-w-[620px] pb-8">
      <Button
        variant="outline"
        size="sm"
        className="mt-8 text-xs font-semibold text-muted"
        type="button"
        onClick={onBack}>
        <ArrowLeft size={17} /> Settings
      </Button>
      <div className="mt-8">
        <p className="mb-[15px] font-mono text-[11px] uppercase tracking-[.12em] text-muted">recurring controls</p>
        <h1 className="text-[clamp(42px,7vw,68px)]">Budget settings</h1>
        <p className="mt-4 text-sm text-muted">These limits apply automatically to every month.</p>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-2">
        {expenseCategories.map((item) => (
          <button
            key={item}
            type="button"
            className={clsx(
              'inline-flex min-h-14 items-center gap-2.5 rounded-xl border border-line bg-soft px-4 text-left text-sm text-muted transition hover:text-ink',
              category === item && 'border-ink bg-white text-ink',
            )}
            onClick={() => setCategory(item)}>
            <span className={categoryClass(item)}>{categoryIcon(item, 18)}</span>
            {item}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-2">
        <label className="text-[11px] font-bold text-muted" htmlFor="budget-amount">
          Monthly limit for {category}
        </label>
        <div className="grid gap-2">
          <input
            id="budget-amount"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(formatMoneyInput(event.target.value))}
            className="h-11 min-w-0 w-full rounded-[14px] border border-line-strong px-3 py-2 text-base outline-0 focus:border-ink"
            placeholder={currentBudget ? Number(currentBudget.amount).toLocaleString('en-US') : '0'}
          />
          <Button
            variant="outline"
            className="h-10 min-h-10 w-full text-xs font-bold text-ink disabled:pointer-events-none"
            type="button"
            onClick={handleSave}
            disabled={isSaving || !amount.trim()}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
      {isLoading && (
        <p className="m-0 mt-4 font-mono text-[10px] uppercase tracking-[.06em] text-muted">Loading budgets…</p>
      )}
      {error && (
        <p
          className="m-0 rounded-[14px] border border-line-strong bg-soft px-3 py-[11px] text-[11px] leading-[1.55] text-danger"
          role="alert">
          {error}
        </p>
      )}
      {budgets.length > 0 && (
        <div className="mt-7 border-t border-line pt-4">
          <p className="m-0 mt-4 font-mono text-[10px] uppercase tracking-[.06em] text-muted">Recurring budgets</p>
          {budgets.map((budget) => (
            <div
              className="flex min-h-[54px] items-center gap-3 border-b border-line font-mono text-xs"
              key={budget.id}>
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span
                  className={clsx(
                    'grid size-7 shrink-0 place-items-center rounded-full border text-current',
                    categoryClass(budget.category),
                  )}>
                  {categoryIcon(budget.category, 16)}
                </span>
                {budget.category}
              </span>
              <strong className="font-normal text-ink">{formatShort(budget.amount)}</strong>
              <Button
                variant="ghost"
                size="icon-xs"
                className="rounded-xl p-1 text-muted transition hover:text-danger"
                type="button"
                aria-label={`Remove ${budget.category} budget`}
                onClick={() => removeBudget(budget)}>
                <Trash size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
