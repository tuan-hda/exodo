import { Check, CircleNotch } from '@phosphor-icons/react'
import { Button } from '../../components/ui/button'
import { ComposerStepActions } from './ComposerStepActions'
import { evaluateExpression, formatMoney } from './entry-utils'
import type { Entry, EntryType } from './types'

const errorClassName =
  'm-0 rounded-[14px] border border-line-strong bg-soft px-3 py-[11px] text-[11px] leading-[1.55] text-danger'
const inputClassName =
  'min-w-0 max-w-full w-full rounded-[14px] border border-line-strong bg-white px-3 py-2 text-base text-ink outline-0 transition focus:border-ink'
const saveButtonClassName =
  'h-10 min-h-10 w-auto rounded-xl border border-ink bg-ink px-4 py-2 text-sm font-bold text-white shadow-[0_2px_5px_rgb(21_21_21_/_0.08)] transition active:scale-[.98] flex-1'

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
      <div className="grid gap-3 rounded-[18px] border border-line-strong bg-soft p-4">
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
      </div>
      <label className="grid min-w-0 gap-1.5 text-[11px] font-bold text-muted max-[700px]:text-xs">
        Name{' '}
        <span className="ml-1 font-mono text-[10px] font-normal uppercase tracking-[.06em] text-muted">optional</span>
        <input
          className={inputClassName}
          disabled={disabled}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={type === 'income' ? 'Salary, bonus...' : 'Coffee, groceries...'}
        />
      </label>
      <label className="grid min-w-0 gap-1.5 text-[11px] font-bold text-muted max-[700px]:text-xs">
        Date and time
        <input
          disabled={disabled}
          className={inputClassName}
          type="datetime-local"
          value={occurredAt}
          onChange={(event) => onOccurredAtChange(event.target.value)}
        />
      </label>
      {error && (
        <p className={errorClassName} role="alert">
          {error}
        </p>
      )}
      <ComposerStepActions disabled={disabled} onBack={onBack}>
        <Button className={saveButtonClassName} disabled={disabled} type="submit" variant="default">
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
