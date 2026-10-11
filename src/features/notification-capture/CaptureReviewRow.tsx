'use client'

import { useId } from 'react'
import { TransactionReviewFields } from '@/features/inbox/TransactionReviewFields'
import { CaptureTransactionSummary } from './CaptureTransactionSummary'
import { reviewAmount, type ReviewCapture } from './capture-review'

function captureTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export function CaptureReviewRow({
  capture,
  selected,
  disabled,
  onToggle,
  onChange,
}: {
  capture: ReviewCapture
  selected: boolean
  disabled: boolean
  onToggle: () => void
  onChange: (changes: Partial<Pick<ReviewCapture, 'name' | 'category' | 'divided'>>) => void
}) {
  const nameId = useId()
  return (
    <li className="grid min-w-0 gap-2 border-b border-line py-4 [overflow-wrap:anywhere]">
      {capture.transaction ? (
        <>
          <div className="grid min-w-0 grid-cols-[20px_minmax(0,1fr)] items-start gap-3">
            <input
              type="checkbox"
              className="size-5 accent-ink"
              aria-label={`Select ${capture.transaction.source} transaction`}
              checked={selected}
              disabled={disabled}
              onChange={onToggle}
            />
            <CaptureTransactionSummary transaction={{ ...capture.transaction, amount: reviewAmount(capture) }} />
          </div>
          <TransactionReviewFields
            amount={capture.transaction.amount}
            category={capture.category}
            onCategoryChange={(category) => onChange({ category })}
            divided={capture.divided}
            onToggleDivide={() => onChange({ divided: !capture.divided })}
            name={capture.name}
            onNameChange={(name) => onChange({ name })}
            nameId={nameId}
            disabled={disabled}
          />
        </>
      ) : (
        <p className="text-xs text-muted">Transaction not recognized</p>
      )}
      <details className="group min-w-0 text-sm">
        <summary className="min-h-11 cursor-pointer py-3 text-xs text-muted">
          <span className="group-open:hidden">Show raw</span>
          <span className="hidden group-open:inline">Hide raw</span>
        </summary>
        <div className="grid min-w-0 gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span className="break-all">
              {capture.source_app} · {capture.type}
            </span>
            <time dateTime={capture.received_at}>{captureTime(capture.received_at)}</time>
          </div>
          {capture.title && <p className="break-words font-medium">{capture.title}</p>}
          {capture.subtitle && <p className="break-words text-xs text-muted">{capture.subtitle}</p>}
          <p className="whitespace-pre-wrap break-words leading-relaxed">{capture.message || 'No message content.'}</p>
          <p className="break-all text-xs text-muted">
            {capture.device_id} · Captured {captureTime(capture.captured_at)}
          </p>
        </div>
      </details>
    </li>
  )
}
