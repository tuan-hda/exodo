'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowClockwise, EnvelopeSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StateMessage } from '@/components/StateMessage'
import type { Category } from '@/features/finance/category'
import { GmailTransactionListItem } from './GmailTransactionListItem'
import { GmailReadError, readGmailJson } from './gmail-client'
import { parseGmailMessagePage, type GmailMessageSummary } from './types'

export function GmailInbox() {
  const [messages, setMessages] = useState<GmailMessageSummary[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(() => new Set())
  const [categoriesById, setCategoriesById] = useState<Record<string, Category>>({})
  const [namesById, setNamesById] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<GmailReadError | null>(null)
  const requestRef = useRef<AbortController | null>(null)
  const failedPageRef = useRef<string | undefined>(undefined)

  const load = useCallback(async (pageToken?: string, refresh = false) => {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setError(null)
    failedPageRef.current = pageToken
    try {
      const params = new URLSearchParams()
      if (pageToken) params.set('pageToken', pageToken)
      if (refresh) params.set('refresh', '1')
      const query = params.size ? `?${params}` : ''
      const page = parseGmailMessagePage(await readGmailJson(`/api/gmail/messages${query}`, controller.signal))
      if (controller.signal.aborted) return
      setMessages((current) =>
        pageToken
          ? [...current, ...page.messages.filter((message) => !current.some((item) => item.id === message.id))]
          : page.messages,
      )
      setNextPageToken(page.nextPageToken)
      if (!pageToken) setDeselectedIds(new Set())
    } catch (error) {
      if (!controller.signal.aborted)
        setError(
          error instanceof GmailReadError
            ? error
            : new GmailReadError('Could not load transactions. Please try again.'),
        )
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    return () => requestRef.current?.abort()
  }, [load])

  const transactions = messages
    .filter((message) => message.transaction !== null)
    .sort(
      (a, b) =>
        Date.parse(b.transaction?.occurredAt ?? b.receivedAt) - Date.parse(a.transaction?.occurredAt ?? a.receivedAt),
    )
  const selectedCount = transactions.filter((message) => !deselectedIds.has(message.id)).length
  const allSelected = transactions.length > 0 && selectedCount === transactions.length

  function toggleTransaction(id: string) {
    setDeselectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section className="grid min-w-0 gap-4" aria-label="Transactions" aria-busy={loading}>
      <div className="flex items-center justify-between gap-3">
        <p className="ui-eyebrow">Transactions</p>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Refresh transactions"
          title="Refresh transactions"
          disabled={loading}
          onClick={() => void load(undefined, true)}>
          <ArrowClockwise size={18} />
        </Button>
      </div>
      {loading && !messages.length && (
        <div className="grid gap-4" role="status" aria-label="Loading transactions">
          {[0, 1, 2].map((value) => (
            <div key={value} className="grid gap-2 border-b border-line pb-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      )}
      {!loading && !error && !messages.length && (
        <p className="py-8 text-center text-sm text-muted">
          {nextPageToken ? 'No VPBank or Cake transactions in this page.' : 'No VPBank or Cake transactions found.'}
        </p>
      )}
      {transactions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="size-5 accent-ink"
              checked={allSelected}
              disabled={loading}
              ref={(input) => {
                if (input) input.indeterminate = selectedCount > 0 && !allSelected
              }}
              onChange={() =>
                setDeselectedIds(allSelected ? new Set(transactions.map((message) => message.id)) : new Set())
              }
            />
            Select all loaded
          </label>
          <span className="text-xs text-muted" role="status" aria-live="polite">
            {selectedCount} selected
          </span>
        </div>
      )}
      {nextPageToken && (
        <div className="flex justify-center">
          <Button variant="outline" disabled={loading} onClick={() => void load(nextPageToken)}>
            {loading ? 'Loading…' : 'Load previous transactions'}
          </Button>
        </div>
      )}
      <ul className="m-0 min-w-0 list-none p-0">
        {transactions.map((message) => (
          <GmailTransactionListItem
            key={message.id}
            transaction={message.transaction}
            category={categoriesById[message.id] ?? 'Dining'}
            onCategoryChange={(category) => setCategoriesById((current) => ({ ...current, [message.id]: category }))}
            name={namesById[message.id] ?? ''}
            onNameChange={(name) => setNamesById((current) => ({ ...current, [message.id]: name }))}
            nameId={`gmail-transaction-${message.id}-name`}
            selected={!deselectedIds.has(message.id)}
            disabled={loading}
            onToggle={() => toggleTransaction(message.id)}
          />
        ))}
      </ul>
      {transactions.length > 0 && (
        <div>
          <Button variant="default" className="w-full" disabled title="Batch saving is not available yet">
            Add selected ({selectedCount})
          </Button>
        </div>
      )}
      {error && (
        <div className="grid gap-3 rounded-panel border border-line bg-surface p-4 shadow-panel">
          <StateMessage tone="danger">{error.message}</StateMessage>
          {error.reconnect ? (
            <Button asChild variant="secondary">
              <a href="/api/gmail/connect">
                <EnvelopeSimple size={16} /> Reconnect Gmail
              </a>
            </Button>
          ) : (
            <Button variant="secondary" disabled={loading} onClick={() => void load(failedPageRef.current)}>
              <ArrowClockwise size={16} /> Try again
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
