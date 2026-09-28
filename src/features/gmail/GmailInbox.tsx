'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowClockwise, EnvelopeSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StateMessage } from '@/components/StateMessage'
import { GmailMessageReader } from './GmailMessageReader'
import { formatEmailDate, GmailReadError, readGmailJson } from './gmail-client'
import { parseGmailMessagePage, type GmailMessageSummary } from './types'

export function GmailInbox() {
  const [messages, setMessages] = useState<GmailMessageSummary[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [selected, setSelected] = useState<GmailMessageSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<GmailReadError | null>(null)
  const requestRef = useRef<AbortController | null>(null)
  const failedPageRef = useRef<string | undefined>(undefined)

  const load = useCallback(async (pageToken?: string) => {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setError(null)
    failedPageRef.current = pageToken
    try {
      const query = pageToken ? `?${new URLSearchParams({ pageToken })}` : ''
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
          error instanceof GmailReadError ? error : new GmailReadError('Could not load your emails. Please try again.'),
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
    <section className="grid min-w-0 gap-4" aria-label="Gmail inbox" aria-busy={loading}>
      <div className="flex items-center justify-between gap-3">
        <p className="ui-eyebrow">Recent emails</p>
        <Button variant="outline" disabled={loading} onClick={() => void load()}>
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
        <div className="grid gap-4" role="status" aria-label="Loading emails">
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
        <p className="py-8 text-center text-sm text-muted">Your Gmail inbox is empty.</p>
      )}
      <ul className="m-0 min-w-0 list-none p-0">
        {messages.map((message) => (
          <li key={message.id}>
            <Button
              variant="list"
              size="row"
              onClick={() => setSelected(message)}
              aria-label={`Read ${message.subject} from ${message.sender}`}>
              <EnvelopeSimple size={20} weight={message.unread ? 'fill' : 'regular'} />
              <span className="grid min-w-0 flex-1 gap-1 text-left">
                <span className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="min-w-0 truncate text-xs text-muted">{message.sender || 'Unknown sender'}</span>
                  <span className="text-[10px] text-muted">{formatEmailDate(message.receivedAt)}</span>
                </span>
                <span className={message.unread ? 'truncate text-sm font-semibold' : 'truncate text-sm font-normal'}>
                  {message.subject}
                </span>
                <span className="truncate text-xs font-normal text-muted">{message.snippet}</span>
              </span>
            </Button>
          </li>
        ))}
      </ul>
      {nextPageToken && (
        <div className="flex justify-center">
          <Button variant="outline" disabled={loading} onClick={() => void load(nextPageToken)}>
            {loading ? 'Loading…' : 'Load older emails'}
          </Button>
        </div>
      )}
      {selected && <GmailMessageReader key={selected.id} summary={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
