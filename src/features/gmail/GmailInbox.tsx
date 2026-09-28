'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StateMessage } from '@/components/StateMessage'
import { GmailTransactionDetails } from './GmailTransactionDetails'
import { GmailReadError, readGmailJson } from './gmail-client'
import { parseGmailMessagePage, type GmailMessageSummary } from './types'

export function GmailInbox() {
  const [messages, setMessages] = useState<GmailMessageSummary[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
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

  return (
    <section className="grid min-w-0 gap-4" aria-label="Transactions" aria-busy={loading}>
      <div className="flex items-center justify-between gap-3">
        <p className="ui-eyebrow">Transactions</p>
        <Button variant="outline" disabled={loading} onClick={() => void load(undefined, true)}>
          <ArrowClockwise size={16} /> Refresh
        </Button>
      </div>
      {error && (
        <div className="grid gap-3">
          <StateMessage tone="danger">{error.message}</StateMessage>
          {error.reconnect ? (
            <Button asChild variant="outline">
              <a href="/api/gmail/connect">Reconnect Gmail</a>
            </Button>
          ) : (
            <div>
              <Button variant="outline" disabled={loading} onClick={() => void load(failedPageRef.current)}>
                Try again
              </Button>
            </div>
          )}
        </div>
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
      <ul className="m-0 min-w-0 list-none p-0">
        {messages.map((message) =>
          message.transaction ? (
            <li key={message.id} className="border-b border-line py-4">
              <GmailTransactionDetails transaction={message.transaction} />
            </li>
          ) : null,
        )}
      </ul>
      {nextPageToken && (
        <div className="flex justify-center">
          <Button variant="outline" disabled={loading} onClick={() => void load(nextPageToken)}>
            {loading ? 'Loading…' : 'Load older transactions'}
          </Button>
        </div>
      )}
    </section>
  )
}
