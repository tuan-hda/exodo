import { Check, CircleNotch } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { StateMessage } from '@/components/StateMessage'
import { CategoryIcon } from '@/features/finance/CategoryIcon'
import { categoryForegroundClass } from '@/features/finance/category'
import { ComposerStepActions } from './ComposerStepActions'
import type { Entry, EntryType } from './types'
import { evaluateExpression } from '@/lib/amount'
import { formatMoney } from '@/lib/money'

export function ComposerReviewStep({
  entry,
  type,
  amount,
  title,
  occurredAt,
  disabled,
  isSaving,
  error,
  category,
  onTitleChange,
  onOccurredAtChange,
  onBack,
}: {
  entry?: Entry
  type: EntryType
  amount: string
  title: string
  occurredAt: string
  disabled: boolean
  isSaving: boolean
  error: string
  category: string
  onTitleChange: (title: string) => void
  onOccurredAtChange: (occurredAt: string) => void
  onBack: () => void
}) {
  return (
    <section className="grid content-start gap-4" aria-label="Review record">
      <Card className="grid gap-3 p-4">
        <div className="flex items-end justify-between border-b border-line-strong pb-3">
          <span className={clsx('ui-label', type === 'income' ? 'text-success' : 'text-category-coral')}>
            {type === 'income' ? 'Income' : 'Expense'}
          </span>
          <strong
            className={clsx(
              'ui-number text-2xl font-semibold tracking-[-.05em]',
              type === 'income' ? 'text-success' : 'text-category-coral',
            )}>
            {formatMoney(evaluateExpression(amount))}
          </strong>
        </div>
        <div className="flex items-center justify-between">
          <span className="ui-label">Category</span>
          <span className={clsx('flex items-center gap-2 text-sm font-medium', categoryForegroundClass(category))}>
            <CategoryIcon category={category} size="xs" shape="control" />
            {category}
          </span>
        </div>
      </Card>
      <Field>
        <FieldLabel htmlFor="entry-title" hint="optional">
          Name
        </FieldLabel>
        <Input
          id="entry-title"
          disabled={disabled}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={type === 'income' ? 'Salary, bonus...' : 'Coffee, groceries...'}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="entry-occurred-at">Date and time</FieldLabel>
        <Input
          id="entry-occurred-at"
          disabled={disabled}
          type="datetime-local"
          value={occurredAt}
          onChange={(event) => onOccurredAtChange(event.target.value)}
        />
      </Field>
      {error && <StateMessage tone="danger">{error}</StateMessage>}
      <ComposerStepActions disabled={disabled} onBack={onBack}>
        <Button
          className="flex-1 gap-2"
          disabled={disabled}
          type="submit"
          variant={type === 'income' ? 'income-primary' : 'expense-primary'}>
          {isSaving ? (
            <>
              <CircleNotch className="animate-spin" size={17} /> Saving…
            </>
          ) : (
            <>
              {entry ? 'Save changes' : 'Save record'} <Check size={17} weight="bold" />
            </>
          )}
        </Button>
      </ComposerStepActions>
    </section>
  )
}
