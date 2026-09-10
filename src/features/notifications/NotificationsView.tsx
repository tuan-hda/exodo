'use client'

import { ArrowClockwise, Bell, EnvelopeSimple } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { PageShell } from '@/components/PageShell'
import { IconTile } from '@/components/IconTile'
import { StateMessage } from '@/components/StateMessage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { parseGmailStatus } from '@/features/gmail/types'
import { updateSearchParams } from '@/features/navigation/navigation'

type GmailStatus = 'loading' | 'connected' | 'disconnected' | 'unavailable' | 'error'

function getGmailPresentation(status: GmailStatus, email: string) {
  if (status === 'loading') {
    return {
      title: 'Checking Gmail.',
      description: 'Checking whether transaction alerts are ready to review.',
    }
  }
  if (status === 'error') {
    return {
      title: 'Gmail status is unavailable.',
      description: 'We could not confirm the connection status.',
    }
  }
  if (status === 'unavailable') {
    return {
      title: 'Gmail is not enabled.',
      description: 'Gmail notifications are not enabled for this account.',
    }
  }
  if (status === 'connected') {
    return {
      title: 'Gmail is connected.',
      description: `Transaction alerts from ${email} will appear here for you to name, categorize, and approve.`,
    }
  }
  return {
    title: 'Connect your Gmail.',
    description: 'Connect your Gmail so Exodo can find transaction alerts for your review.',
  }
}

export function NotificationsView() {
  const [status, setStatus] = useState<GmailStatus>('loading')
  const [gmailEmail, setGmailEmail] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState<'connected' | 'error' | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get('gmail')
    if (result !== 'connected' && result !== 'error') return
    setNotice(result)
    window.history.replaceState(null, '', updateSearchParams(window.location.href, { gmail: null }))
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
        const data = parseGmailStatus(await response.json())
        setStatus(data.connected ? 'connected' : 'disconnected')
        setGmailEmail(data.email ?? '')
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
  const presentation = getGmailPresentation(status, gmailEmail)
  return (
    <PageShell size="centered" aria-busy={isLoading}>
      <div className="grid justify-items-center gap-5">
        <IconTile size="xl" shape="circle" tone="muted">
          <Bell size={24} weight="regular" />
        </IconTile>
        <PageHeader
          eyebrow="inbox"
          title={presentation.title}
          description={presentation.description}
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
    </PageShell>
  )
}
