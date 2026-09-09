'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { Trash } from '@phosphor-icons/react'
import { useUser } from '@clerk/nextjs'
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
import { Button } from '@/components/ui/button'
import { categoryClass, categoryIcon, expenseCategories } from '@/features/entries/CategoryPicker'
import { formatMoney, formatMoneyInput } from '@/features/entries/entry-utils'
import type { CategoryBudget } from '@/features/budgets/types'
import { useBudgets } from '@/features/budgets/use-budgets'
import { PageHeader } from '@/components/PageHeader'
import { StateMessage } from '@/components/StateMessage'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export function BudgetSettingsView({ onBack }: { onBack: () => void }) {
  const { user } = useUser()
  const [category, setCategory] = useState(expenseCategories[0])
  const [amount, setAmount] = useState('')
  const [budgetToRemove, setBudgetToRemove] = useState<CategoryBudget | null>(null)
  const [notice, setNotice] = useState('')
  const { budgets, isLoading, isSaving, isRemoving, error, saveBudget, removeBudget } = useBudgets(user?.id)
  const currentBudget = budgets.find((budget) => budget.category === category)

  async function handleSave() {
    setNotice('')
    const value = Number(amount.replace(/,/g, ''))
    if (await saveBudget(category, value)) {
      setAmount('')
      setNotice(`${category} budget saved.`)
    }
  }

  async function handleRemove() {
    if (!budgetToRemove) return
    const removedCategory = budgetToRemove.category
    if (await removeBudget(budgetToRemove)) {
      setBudgetToRemove(null)
      setNotice(`${removedCategory} budget removed.`)
    }
  }

  return (
    <section className="ui-page-enter mx-auto grid max-w-[620px] gap-8 pb-8">
      <PageHeader
        eyebrow="recurring controls"
        title="Budget settings"
        description="These limits apply automatically to every month."
        backLabel="Settings"
        onBack={onBack}
      />
      <div className="grid grid-cols-2 gap-2">
        {expenseCategories.map((item) => (
          <Button
            key={item}
            type="button"
            variant="option"
            size="option"
            className={clsx(categoryClass(item))}
            data-selected={category === item}
            aria-pressed={category === item}
            onClick={() => {
              setNotice('')
              setCategory(item)
            }}>
            <span className={categoryClass(item)}>{categoryIcon(item, 18)}</span>
            {item}
          </Button>
        ))}
      </div>
      <div className="grid gap-2">
        <label className="ui-field-label" htmlFor="budget-amount">
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
          <Button className="w-full" type="button" onClick={handleSave} disabled={isSaving || !amount.trim()}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
      {isLoading && budgets.length === 0 && (
        <div className="grid gap-3" role="status" aria-label="Loading budgets">
          {Array.from({ length: 2 }, (_, index) => (
            <div className="flex min-h-14 items-center gap-3 border-b border-line" key={index}>
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="ml-auto h-3 w-24" />
            </div>
          ))}
        </div>
      )}
      {error && <StateMessage tone="danger">{error}</StateMessage>}
      {notice && !error && <StateMessage tone="success">{notice}</StateMessage>}
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
              <strong className="ui-number font-normal text-ink">{formatMoney(budget.amount)}</strong>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted hover:text-danger"
                type="button"
                aria-label={`Remove ${budget.category} budget`}
                onClick={() => setBudgetToRemove(budget)}>
                <Trash size={16} />
              </Button>
            </div>
          ))}
        </section>
      )}
      <AlertDialog open={Boolean(budgetToRemove)} onOpenChange={(open) => !open && setBudgetToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this budget?</AlertDialogTitle>
            <AlertDialogDescription>
              {budgetToRemove?.category} will no longer have a recurring monthly limit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isRemoving} onClick={() => void handleRemove()}>
              {isRemoving ? 'Removing…' : 'Remove budget'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
