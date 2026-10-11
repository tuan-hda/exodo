'use client'

import { GmailTransactionDetails } from './GmailTransactionDetails'
import type { Category } from '@/features/finance/category'
import { TransactionReviewFields } from '@/features/inbox/TransactionReviewFields'
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
      <TransactionReviewFields
        amount={transaction.amount}
        category={category}
        onCategoryChange={onCategoryChange}
        divided={divided}
        onToggleDivide={onToggleDivide}
        name={name}
        onNameChange={onNameChange}
        nameId={nameId}
        disabled={disabled}
      />
    </li>
  )
}
