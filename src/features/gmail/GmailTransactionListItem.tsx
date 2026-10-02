'use client'

import { useState } from 'react'
import { CategoryOptionGrid } from '@/features/finance/CategoryOptionGrid'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GmailTransactionDetails } from './GmailTransactionDetails'
import { expenseCategories, incomeCategories, type Category } from '@/features/finance/category'
import type { GmailTransaction } from './types'

export function GmailTransactionListItem({
  transaction,
  threadId,
  category,
  onCategoryChange,
  divided,
  onToggleDivide,
  name,
  onNameChange,
  nameId,
  selected,
  disabled,
  onToggle,
}: {
  transaction: GmailTransaction
  threadId: string
  category: Category
  onCategoryChange: (category: Category) => void
  divided: boolean
  onToggleDivide: () => void
  name: string
  onNameChange: (name: string) => void
  nameId: string
  selected: boolean
  disabled: boolean
  onToggle: () => void
}) {
  const [nameEnabled, setNameEnabled] = useState(false)
  const showName = name.length > 0 || nameEnabled
  const availableCategories =
    transaction.amount === null
      ? [...expenseCategories, ...incomeCategories, 'Other']
      : [...(transaction.amount > 0 ? incomeCategories : expenseCategories), 'Other']
  const categories = availableCategories.includes(category) ? availableCategories : [category, ...availableCategories]

  return (
    <li className="border-b border-line">
      <div className="grid min-w-0 grid-cols-[20px_minmax(0,1fr)] items-center gap-3 py-4">
        <input
          type="checkbox"
          className="size-5 accent-ink"
          aria-label={`Select ${transaction.source} transaction`}
          checked={selected}
          disabled={disabled}
          onChange={onToggle}
        />
        <GmailTransactionDetails transaction={transaction} threadId={threadId} />
      </div>
      <div className="grid min-w-0 gap-4 pb-4 pl-8">
        <div className="flex items-center justify-between gap-3">
          <fieldset className="min-w-0" aria-label="Transaction name">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`${nameId}-mode`}
                  className="size-4 accent-ink"
                  checked={showName}
                  disabled={disabled}
                  onChange={() => setNameEnabled(true)}
                />
                Name
              </label>
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`${nameId}-mode`}
                  className="size-4 accent-ink"
                  checked={!showName}
                  disabled={disabled}
                  onChange={() => {
                    setNameEnabled(false)
                    onNameChange('')
                  }}
                />
                No name
              </label>
            </div>
          </fieldset>
          <Button
            variant={divided ? 'default' : 'secondary'}
            aria-label="Split transaction amount in half"
            aria-pressed={divided}
            disabled={disabled || transaction.amount === null || transaction.amount === 0}
            onClick={onToggleDivide}>
            / 2
          </Button>
        </div>
        {showName && (
          <Field>
            <FieldLabel htmlFor={nameId} hint="optional">
              Name
            </FieldLabel>
            <Input
              id={nameId}
              disabled={disabled}
              value={name}
              onChange={(event) => {
                setNameEnabled(true)
                onNameChange(event.target.value)
              }}
              placeholder={
                transaction.amount !== null && transaction.amount > 0 ? 'Salary, bonus...' : 'Coffee, groceries...'
              }
            />
          </Field>
        )}
        <div className="grid min-w-0 gap-2">
          <span className="text-xs text-muted">Category</span>
          <CategoryOptionGrid
            categories={categories}
            value={category}
            disabled={disabled}
            iconOnly
            onChange={onCategoryChange}
          />
        </div>
      </div>
    </li>
  )
}
