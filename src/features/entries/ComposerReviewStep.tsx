import { Check, CircleNotch } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StateMessage } from '@/components/StateMessage'
import { ComposerStepActions } from './ComposerStepActions'
import { evaluateExpression, formatMoney } from './entry-utils'
import type { Entry, EntryType } from './types'

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
      <Card tone="soft" className="grid gap-3 p-4">
        <div className="flex items-end justify-between border-b border-line-strong pb-3">
          <span className="font-mono text-[10px] uppercase tracking-[.08em] text-muted">
            {type === 'income' ? 'Income' : 'Expense'}
          </span>
          <strong className="text-[25px] font-semibold tracking-[-.06em]">
            {formatMoney(evaluateExpression(amount))}
          </strong>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[.08em] text-muted">Category</span>
          <strong className="text-sm font-medium">{category}</strong>
        </div>
      </Card>
      <label className="grid min-w-0 gap-1.5 text-[11px] font-bold text-muted max-md:text-xs">
        Name{' '}
        <span className="ml-1 font-mono text-[10px] font-normal uppercase tracking-[.06em] text-muted">optional</span>
        <Input
          disabled={disabled}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={type === 'income' ? 'Salary, bonus...' : 'Coffee, groceries...'}
        />
      </label>
      <label className="grid min-w-0 gap-1.5 text-[11px] font-bold text-muted max-md:text-xs">
        Date and time
        <Input
          disabled={disabled}
          type="datetime-local"
          value={occurredAt}
          onChange={(event) => onOccurredAtChange(event.target.value)}
        />
      </label>
      {error && <StateMessage tone="danger">{error}</StateMessage>}
      <ComposerStepActions disabled={disabled} onBack={onBack}>
        <Button className="flex-1 gap-2 text-sm font-semibold" disabled={disabled} type="submit" variant="default">
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
