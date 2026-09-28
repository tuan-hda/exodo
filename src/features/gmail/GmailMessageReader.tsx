'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { StateMessage } from '@/components/StateMessage'
import { formatEmailDate, GmailReadError, readGmailJson } from './gmail-client'
import { parseGmailMessage, type GmailMessage, type GmailMessageSummary } from './types'

export function GmailMessageReader({ summary, onClose }: { summary: GmailMessageSummary; onClose: () => void }) {
  const [message, setMessage] = useState<GmailMessage | null>(null)
  const [error, setError] = useState<GmailReadError | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    readGmailJson(`/api/gmail/messages/${encodeURIComponent(summary.id)}`, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setMessage(parseGmailMessage(value))
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            error instanceof GmailReadError
              ? error
              : new GmailReadError('Could not open this email. Please try again.'),
          )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [summary.id, attempt])

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}>
      <SheetContent side="bottom" variant="composer" aria-busy={loading}>
        <div className="min-w-0 border-b border-line pb-5 pr-8">
          <SheetTitle className="break-words text-xl font-semibold">{summary.subject}</SheetTitle>
          <SheetDescription className="mt-3 break-words">From {summary.sender || 'Unknown sender'}</SheetDescription>
          {message?.recipient && <p className="mt-1 break-words text-xs text-muted">To {message.recipient}</p>}
          <p className="mt-2 text-xs text-muted">{formatEmailDate(summary.receivedAt)}</p>
        </div>
        <div className="min-w-0 pt-5">
          {loading ? (
            <div className="grid gap-3" role="status" aria-label="Loading email">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : error ? (
            <div className="grid gap-3">
              <StateMessage tone="danger">{error.message}</StateMessage>
              {error.reconnect ? (
                <Button asChild variant="outline">
                  <a href="/api/gmail/connect">Reconnect Gmail</a>
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setAttempt((value) => value + 1)}>
                  Try again
                </Button>
              )}
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-base leading-relaxed [overflow-wrap:anywhere]">
              {message?.body || 'This email has no readable text body.'}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
