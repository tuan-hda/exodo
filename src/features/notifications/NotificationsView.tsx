'use client'

import { ArrowClockwise, Bell, EnvelopeSimple } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { StateMessage } from '@/components/StateMessage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function NotificationsView() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected' | 'unavailable' | 'error'>('loading')
  const [gmailEmail, setGmailEmail] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState<'connected' | 'error' | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get('gmail')
    if (result !== 'connected' && result !== 'error') return
    setNotice(result)
    const url = new URL(window.location.href)
    url.searchParams.delete('gmail')
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadStatus() {
      setStatus('loading')
      setError('')
      try {
        const response = await fetch('/api/gmail/status', { cache: 'no-store', signal: controller.signal })
        if (response.status === 403) {
          setStatus('unavailable')
          return
        }
        if (!response.ok) throw new Error('Unable to load Gmail status.')
        const data = (await response.json()) as { connected?: boolean; email?: string }
        setStatus(data.connected ? 'connected' : 'disconnected')
        setGmailEmail(typeof data.email === 'string' ? data.email : '')
      } catch {
        if (!controller.signal.aborted) {
          setStatus('error')
          setError('Could not check Gmail right now. Try again in a moment.')
        }
      }
    }

    void loadStatus()
    return () => controller.abort()
  }, [retryKey])

  const connected = status === 'connected'
  const isLoading = status === 'loading'
  return (
    <section
      className="mx-auto grid max-w-[560px] gap-8 pb-12 text-center animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_both]"
      aria-busy={isLoading}>
      <div className="grid justify-items-center gap-5">
        <span className="ui-icon-tile size-14 rounded-full">
          <Bell size={24} weight="regular" />
        </span>
        <PageHeader
          eyebrow="inbox"
          title={
            isLoading
              ? 'Checking Gmail.'
              : status === 'error'
                ? 'Gmail status is unavailable.'
                : connected
                  ? 'Gmail is connected.'
                  : 'Connect your Gmail.'
          }
          description={
            isLoading
              ? 'Checking whether transaction alerts are ready to review.'
              : status === 'error'
                ? 'We could not confirm the connection status.'
                : status === 'unavailable'
                  ? 'Gmail notifications are not enabled for this account.'
                  : connected
                    ? `Transaction alerts from ${gmailEmail} will appear here for you to name, categorize, and approve.`
                    : 'Connect your Gmail so Exodo can find transaction alerts for your review.'
          }
          className="justify-items-center gap-0"
        />
      </div>
      {isLoading ? (
        <Card tone="flat" className="mx-auto grid w-full max-w-[420px] gap-3 p-5 text-left">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-11 w-36" />
        </Card>
      ) : (
        <div className="grid justify-items-center gap-3">
          {notice === 'connected' && (
            <StateMessage tone="success">Gmail connected. Exodo can review alerts now.</StateMessage>
          )}
          {notice === 'error' && <StateMessage tone="danger">Gmail connection failed. Try again.</StateMessage>}
          {status === 'error' && <StateMessage tone="danger">{error}</StateMessage>}
          {status === 'error' ? (
            <Button variant="outline" type="button" onClick={() => setRetryKey((key) => key + 1)}>
              <ArrowClockwise size={17} /> Try again
            </Button>
          ) : status === 'unavailable' ? null : (
            <Button asChild variant="outline-muted">
              <a href="/api/gmail/connect">
                <EnvelopeSimple size={17} /> {connected ? 'Reconnect Gmail' : 'Connect Gmail'}
              </a>
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
