import { formatMoney } from '@/lib/money'
import type { CaptureTransaction } from './capture-parser'

const sourceLabels = {
  cake: 'Cake',
  'vpbank-credit': 'VPBank Credit',
  'vpbank-debit': 'VPBank Debit',
  techcombank: 'Techcombank',
}

const transactionDate = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'medium',
  timeZone: 'Asia/Ho_Chi_Minh',
})

export function CaptureTransactionSummary({ transaction }: { transaction: CaptureTransaction }) {
  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted">{sourceLabels[transaction.source]}</span>
        <span
          className={`ui-number text-base font-semibold ${
            transaction.amount === null || transaction.amount === 0
              ? 'text-ink'
              : transaction.amount > 0
                ? 'text-success'
                : 'text-danger'
          }`}>
          {transaction.amount === null
            ? 'Amount unavailable'
            : `${transaction.amount > 0 ? '+' : ''}${formatMoney(transaction.amount)}`}
        </span>
      </div>
      <p className="text-xs text-muted">
        {transaction.occurredAt
          ? transactionDate.format(new Date(transaction.occurredAt))
          : 'Transaction date unavailable'}
      </p>
      <div className="grid gap-1">
        <p className="text-xs text-muted">Content</p>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {transaction.content ?? 'Transaction content unavailable'}
        </p>
      </div>
    </div>
  )
}
