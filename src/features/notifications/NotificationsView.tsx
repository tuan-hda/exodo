'use client'

import { Bell, EnvelopeSimple } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import { PageHeader } from '../../components/PageHeader'

export function NotificationsView() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')
  const [gmailEmail, setGmailEmail] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadStatus() {
      try {
        const response = await fetch('/api/gmail/status', { signal: controller.signal })
        if (!response.ok) throw new Error('Unable to load Gmail status.')
        const data = await response.json()
        setStatus(data.connected ? 'connected' : 'disconnected')
        setGmailEmail(data.email ?? '')
      } catch {
        if (!controller.signal.aborted) setStatus('disconnected')
      }
    }

    void loadStatus()
    return () => controller.abort()
  }, [])

  const connected = status === 'connected'
  return (
    <section className="mx-auto grid max-w-[560px] gap-8 pb-12 text-center animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_both]">
      <div className="grid justify-items-center gap-5">
        <span className="ui-icon-tile size-14 rounded-full">
          <Bell size={24} weight="regular" />
        </span>
        <PageHeader
          eyebrow="inbox"
          title={status === 'loading' ? 'Checking Gmail.' : connected ? 'Gmail is connected.' : 'Connect your Gmail.'}
          description={
            status === 'loading'
              ? 'Checking whether transaction alerts are ready to review.'
              : connected
                ? `Transaction alerts from ${gmailEmail} will appear here for you to name, categorize, and approve.`
                : 'Connect your Gmail so Exodo can find transaction alerts for your review.'
          }
          className="justify-items-center gap-0"
        />
      </div>
      <div className="flex justify-center">
        {status !== 'loading' && (
          <Button asChild variant="outline" className="text-xs font-semibold text-muted">
            <a href="/api/gmail/connect">
              <EnvelopeSimple size={17} /> {connected ? 'Reconnect Gmail' : 'Connect Gmail'}
            </a>
          </Button>
        )}
      </div>
    </section>
  )
}
