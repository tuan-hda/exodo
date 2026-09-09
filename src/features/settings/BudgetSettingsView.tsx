'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { Trash } from '@phosphor-icons/react'
import { useUser } from '@clerk/nextjs'
import { Button } from '../../components/ui/button'
import { categoryClass, categoryIcon, expenseCategories } from '../entries/CategoryPicker'
import { formatMoneyInput, formatShort } from '../entries/entry-utils'
import { useBudgets } from '../budgets/use-budgets'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/PageHeader'
import { StateMessage } from '@/components/StateMessage'

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
    <section className="mx-auto grid max-w-[620px] gap-8 pb-8 animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_both]">
      <PageHeader
        eyebrow="recurring controls"
        title="Budget settings"
        description="These limits apply automatically to every month."
        backLabel="Settings"
        onBack={onBack}
      />
      <div className="grid grid-cols-2 gap-2">
        {expenseCategories.map((item) => (
          <button
            key={item}
            type="button"
            className={clsx(
              'inline-flex min-h-14 items-center gap-2.5 rounded-[14px] border px-4 text-left text-sm text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink',
              categoryClass(item),
              category === item && 'border-ink bg-surface text-ink shadow-[0_2px_8px_rgb(21_21_21_/_0.06)]',
            )}
            onClick={() => setCategory(item)}>
            <span className={categoryClass(item)}>{categoryIcon(item, 18)}</span>
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-2">
        <label className="text-[11px] font-bold text-muted" htmlFor="budget-amount">
          Monthly limit for {category}
        </label>
        <div className="grid gap-2">
          <Input
            id="budget-amount"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(formatMoneyInput(event.target.value))}
            className="w-full"
            placeholder={currentBudget ? Number(currentBudget.amount).toLocaleString('en-US') : '0'}
          />
          <Button
            className="w-full text-xs font-semibold disabled:pointer-events-none"
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
      {error && <StateMessage tone="danger">{error}</StateMessage>}
      {budgets.length > 0 && (
        <section className="grid gap-3 border-t border-line pt-5" aria-label="Recurring budgets">
          <p className="ui-eyebrow m-0">Recurring budgets</p>
          {budgets.map((budget) => (
            <div
              className="flex min-h-14 items-center gap-3 border-b border-line font-mono text-xs last:border-b-0"
              key={budget.id}>
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className={clsx('ui-icon-tile size-8 rounded-full', categoryClass(budget.category))}>
                  {categoryIcon(budget.category, 16)}
                </span>
                {budget.category}
              </span>
              <strong className="font-normal text-ink">{formatShort(budget.amount)}</strong>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted hover:text-danger"
                type="button"
                aria-label={`Remove ${budget.category} budget`}
                onClick={() => removeBudget(budget)}>
                <Trash size={16} />
              </Button>
            </div>
          ))}
        </section>
      )}
    </section>
  )
}
