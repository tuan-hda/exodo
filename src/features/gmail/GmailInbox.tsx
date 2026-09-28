'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowClockwise, EnvelopeSimple } from '@phosphor-icons/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StateMessage } from '@/components/StateMessage'
import type { Entry } from '@/features/entries/types'
import type { Category } from '@/features/finance/category'
import { GmailTransactionListItem } from './GmailTransactionListItem'
import { GmailReadError, readGmailJson } from './gmail-client'
import { parseGmailMessagePage, type GmailMessageSummary } from './types'

function toEntryDateTime(value: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}`
}

export function GmailInbox({
  onSaveEntries,
  isSaving,
}: {
  onSaveEntries: (entries: Entry[]) => Promise<boolean>
  isSaving: boolean
}) {
  const [messages, setMessages] = useState<GmailMessageSummary[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(() => new Set())
  const [categoriesById, setCategoriesById] = useState<Record<string, Category>>({})
  const [namesById, setNamesById] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [savingBatch, setSavingBatch] = useState(false)
  const [importMessage, setImportMessage] = useState('')
  const [importError, setImportError] = useState('')
  const [confirmAddOpen, setConfirmAddOpen] = useState(false)
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
    .filter(
      (message): message is GmailMessageSummary & { transaction: NonNullable<GmailMessageSummary['transaction']> } =>
        message.transaction !== null,
    )
    .sort(
      (a, b) =>
        Date.parse(a.transaction.occurredAt ?? a.receivedAt) - Date.parse(b.transaction.occurredAt ?? b.receivedAt),
    )
  const selectedCount = transactions.filter((message) => !deselectedIds.has(message.id)).length
  const selectedMessages = transactions.filter((message) => !deselectedIds.has(message.id))
  const selectedHasInvalidAmount = selectedMessages.some(
    (message) => message.transaction.amount === null || message.transaction.amount === 0,
  )
  const allSelected = transactions.length > 0 && selectedCount === transactions.length

  async function addSelectedTransactions() {
    if (selectedMessages.length === 0 || selectedHasInvalidAmount || savingBatch || isSaving) return
    const entries: Entry[] = selectedMessages.flatMap((message) => {
      const transaction = message.transaction
      if (transaction?.amount === null || !transaction) return []
      return [
        {
          id: crypto.randomUUID(),
          type: transaction.amount > 0 ? 'income' : 'expense',
          amount: Math.abs(transaction.amount),
          occurredAt: toEntryDateTime(transaction.occurredAt ?? message.receivedAt),
          title: namesById[message.id]?.trim() ?? '',
          category: categoriesById[message.id] ?? (transaction.amount > 0 ? 'Income' : 'Dining'),
        },
      ]
    })
    if (entries.length !== selectedMessages.length) return

    setSavingBatch(true)
    setImportMessage('')
    setImportError('')
    let entriesSaved = false
    try {
      const saved = await onSaveEntries(entries)
      if (!saved) {
        setImportError('Could not add the selected transactions. Please try again.')
        return
      }
      entriesSaved = true

      const lastImportedAt = selectedMessages.reduce(
        (latest, message) => (message.receivedAt > latest ? message.receivedAt : latest),
        selectedMessages[0].receivedAt,
      )
      setMessages((current) =>
        current.filter((message) => !selectedMessages.some((selected) => selected.id === message.id)),
      )
      setDeselectedIds(new Set())

      const response = await fetch('/api/gmail/import-state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastImportedAt }),
      })
      if (!response.ok) {
        setImportError(
          'Transactions were saved, but Gmail’s import cursor could not be updated. Do not add these records again.',
        )
        return
      }

      setImportMessage(`${entries.length} transaction${entries.length === 1 ? '' : 's'} added.`)
      await load(undefined, true)
    } catch {
      setImportError(
        entriesSaved
          ? 'Transactions were saved, but Gmail’s import cursor could not be updated. Do not add these records again.'
          : 'Transactions could not be added. Please try again.',
      )
    } finally {
      setSavingBatch(false)
    }
  }

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
      {importMessage && <StateMessage tone="success">{importMessage}</StateMessage>}
      {importError && <StateMessage tone="danger">{importError}</StateMessage>}
      {selectedHasInvalidAmount && selectedCount > 0 && (
        <StateMessage tone="danger">Deselect transactions without a valid amount before adding the rest.</StateMessage>
      )}
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
            threadId={message.threadId}
            category={categoriesById[message.id] ?? ((message.transaction.amount ?? 0) > 0 ? 'Income' : 'Dining')}
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
          <Button
            variant="default"
            className="w-full"
            disabled={selectedCount === 0 || selectedHasInvalidAmount || isSaving || savingBatch}
            onClick={() => setConfirmAddOpen(true)}>
            {savingBatch || isSaving ? 'Adding…' : `Add selected (${selectedCount})`}
          </Button>
        </div>
      )}
      <AlertDialog open={confirmAddOpen} onOpenChange={setConfirmAddOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add selected transactions?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCount} transaction{selectedCount === 1 ? '' : 's'} will be saved to your records. Gmail’s import
              cursor will advance to the newest selected email, removing older emails from this review list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={savingBatch || isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={selectedCount === 0 || selectedHasInvalidAmount || savingBatch || isSaving}
              onClick={(event) => {
                event.preventDefault()
                setConfirmAddOpen(false)
                void addSelectedTransactions()
              }}>
              Add transactions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
