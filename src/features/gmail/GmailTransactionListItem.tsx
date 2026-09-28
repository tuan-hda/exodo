'use client'

import { useState } from 'react'
import { CategoryOptionGrid } from '@/features/finance/CategoryOptionGrid'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { GmailTransactionDetails } from './GmailTransactionDetails'
import { expenseCategories, incomeCategories, type Category } from '@/features/finance/category'
import type { GmailTransaction } from './types'

export function GmailTransactionListItem({
  transaction,
  category,
  onCategoryChange,
  name,
  onNameChange,
  nameId,
  selected,
  disabled,
  onToggle,
}: {
  transaction: GmailTransaction
  category: Category
  onCategoryChange: (category: Category) => void
  name: string
  onNameChange: (name: string) => void
  nameId: string
  selected: boolean
  disabled: boolean
  onToggle: () => void
}) {
  const [showName, setShowName] = useState(name.length > 0)
  const availableCategories =
    transaction.amount === null
      ? [...expenseCategories, ...incomeCategories, 'Other']
      : [...(transaction.amount > 0 ? incomeCategories : expenseCategories), 'Other']
  const categories = availableCategories.includes(category) ? availableCategories : [category, ...availableCategories]

  return (
    <li className="border-b border-line">
      <label className="grid min-h-11 cursor-pointer grid-cols-[20px_minmax(0,1fr)] items-center gap-3 py-4">
        <input
          type="checkbox"
          className="size-5 accent-ink"
          checked={selected}
          disabled={disabled}
          onChange={onToggle}
        />
        <GmailTransactionDetails transaction={transaction} />
      </label>
      <div className="grid min-w-0 gap-4 pb-4 pl-8">
        <fieldset className="grid min-w-0 gap-3" aria-label="Transaction name">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name={`${nameId}-mode`}
                className="size-4 accent-ink"
                checked={showName}
                disabled={disabled}
                onChange={() => setShowName(true)}
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
                onChange={() => setShowName(false)}
              />
              No name
            </label>
          </div>
        </fieldset>
        {showName && (
          <Field>
            <FieldLabel htmlFor={nameId} hint="optional">
              Name
            </FieldLabel>
            <Input
              id={nameId}
              disabled={disabled}
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
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
