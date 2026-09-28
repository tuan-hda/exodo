import { ArrowSquareOut } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/money'
import type { GmailTransaction } from './types'

const sourceLabels = {
  cake: 'Cake',
  'vpbank-credit': 'VPBank Credit',
  'vpbank-debit': 'VPBank Debit',
}

const transactionDate = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'medium',
  timeZone: 'Asia/Ho_Chi_Minh',
})

export function GmailTransactionDetails({
  transaction,
  threadId,
}: {
  transaction: GmailTransaction
  threadId: string
}) {
  return (
    <span className="grid min-w-0 gap-1 text-left">
      <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="flex items-center gap-1.5">
          <span className="text-xs text-muted">{sourceLabels[transaction.source]}</span>
          <Button asChild variant="ghost" size="icon-xs">
            <a
              href={`https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(threadId)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open email in Gmail"
              title="Open email in Gmail">
              <ArrowSquareOut aria-hidden="true" />
            </a>
          </Button>
        </span>
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
      </span>
      <span className="text-xs font-normal text-muted">
        {transaction.occurredAt
          ? transactionDate.format(new Date(transaction.occurredAt))
          : 'Transaction date unavailable'}
      </span>
    </span>
  )
}
