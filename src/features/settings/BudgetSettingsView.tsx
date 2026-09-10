'use client'

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { Trash } from '@phosphor-icons/react'
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
import { categoryForegroundClass, expenseCategories } from '@/features/finance/category'
import { CategoryIcon } from '@/features/finance/CategoryIcon'
import { CategoryOptionGrid } from '@/features/finance/CategoryOptionGrid'
import type { CategoryBudget } from '@/features/budgets/types'
import type { BudgetState } from '@/features/budgets/use-budgets'
import { PageHeader } from '@/components/PageHeader'
import { PageShell } from '@/components/PageShell'
import { StateMessage } from '@/components/StateMessage'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/lib/money'
import { formatMoneyInput } from '@/lib/amount'

export function BudgetSettingsView({ onBack, budgetState }: { onBack: () => void; budgetState: BudgetState }) {
  const [category, setCategory] = useState(expenseCategories[0])
  const [amount, setAmount] = useState('')
  const [budgetToRemove, setBudgetToRemove] = useState<CategoryBudget | null>(null)
  const [notice, setNotice] = useState('')
  const [validationError, setValidationError] = useState('')
  const { budgets, isLoading, isSaving, isRemoving, error, saveBudget, removeBudget } = budgetState
  const currentBudget = budgets.find((budget) => budget.category === category)

  useEffect(() => {
    setAmount(currentBudget ? formatMoneyInput(String(currentBudget.amount)) : '')
  }, [category, currentBudget?.amount, currentBudget?.id])

  async function handleSave() {
    setNotice('')
    setValidationError('')
    const value = Number(amount.replace(/,/g, ''))
    if (!Number.isFinite(value) || value <= 0) {
      setValidationError('Enter a monthly limit greater than zero.')
      return
    }
    if (await saveBudget(category, value)) {
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
    <PageShell>
      <PageHeader
        eyebrow="recurring controls"
        title="Budget settings"
        description="These limits apply automatically to every month."
        backLabel="Settings"
        onBack={onBack}
      />
      <CategoryOptionGrid
        categories={expenseCategories}
        value={category}
        ariaLabel="Expense categories"
        onChange={(item) => {
          setNotice('')
          setValidationError('')
          setCategory(item)
        }}
      />
      <form
        className="grid gap-2"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void handleSave()
        }}>
        <Field>
          <FieldLabel htmlFor="budget-amount">Monthly limit for {category}</FieldLabel>
          <Input
            id="budget-amount"
            aria-describedby={validationError ? 'budget-amount-error' : undefined}
            aria-invalid={Boolean(validationError)}
            inputMode="numeric"
            value={amount}
            onChange={(event) => {
              setValidationError('')
              setAmount(formatMoneyInput(event.target.value))
            }}
            className="w-full"
            placeholder="0"
          />
        </Field>
        <Button className="w-full" type="submit" disabled={isSaving || !amount.trim()}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </form>
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
      {(validationError || error) && (
        <StateMessage id={validationError ? 'budget-amount-error' : undefined} tone="danger">
          {validationError || error}
        </StateMessage>
      )}
      {notice && !validationError && !error && <StateMessage tone="success">{notice}</StateMessage>}
      {budgets.length > 0 && (
        <section className="grid gap-3 border-t border-line pt-5" aria-label="Recurring budgets">
          <p className="ui-eyebrow m-0">Recurring budgets</p>
          {budgets.map((budget) => (
            <div
              className="flex min-h-14 items-center gap-3 border-b border-line font-mono text-xs last:border-b-0"
              key={budget.id}>
              <span
                className={clsx('flex min-w-0 flex-1 items-center gap-2', categoryForegroundClass(budget.category))}>
                <CategoryIcon category={budget.category} />
                {budget.category}
              </span>
              <strong className="ui-number font-normal text-ink">{formatMoney(budget.amount)}</strong>
              <Button
                variant="destructive-ghost"
                size="icon-xs"
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
            <AlertDialogAction
              variant="destructive"
              disabled={isRemoving}
              onClick={(event) => {
                event.preventDefault()
                void handleRemove()
              }}>
              {isRemoving ? 'Removing…' : 'Remove budget'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}
