import type { EntryType } from './types'

export const entryTypePresentation = {
  income: {
    label: 'Income',
    textClass: 'text-success',
    borderClass: 'border-success/50',
    softClass: 'bg-success-soft',
    solidClass: 'bg-success',
    toggleVariant: 'income',
  },
  expense: {
    label: 'Expense',
    textClass: 'text-category-coral',
    borderClass: 'border-category-coral/50',
    softClass: 'bg-category-coral-soft',
    solidClass: 'bg-category-coral',
    toggleVariant: 'expense',
  },
} as const satisfies Record<
  EntryType,
  {
    label: string
    textClass: string
    borderClass: string
    softClass: string
    solidClass: string
    toggleVariant: 'income' | 'expense'
  }
>
