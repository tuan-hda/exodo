'use client'

import { Bell, EnvelopeSimple } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'

export function NotificationsView() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')
  const [gmailEmail, setGmailEmail] = useState('')

  useEffect(() => {
    fetch('/api/gmail/status')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Unable to load Gmail status.'))))
      .then((data) => {
        setStatus(data.connected ? 'connected' : 'disconnected')
        setGmailEmail(data.email ?? '')
      })
      .catch(() => setStatus('disconnected'))
  }, [])

  const connected = status === 'connected'
  return (
    <section className="mx-auto flex max-w-[460px] flex-col items-center py-16 text-center">
      <div className="mb-5 grid size-14 place-items-center rounded-full bg-soft text-ink">
        <Bell size={24} weight="regular" />
      </div>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[.12em] text-muted">inbox</p>
      <h1 className="mb-4 text-[clamp(34px,5vw,52px)]">{connected ? 'Gmail is connected.' : 'Connect your Gmail.'}</h1>
      <p className="max-w-[330px] text-sm leading-[1.7] text-muted">
        {connected
          ? `Transaction alerts from ${gmailEmail} will appear here for you to name, categorize, and approve.`
          : 'Connect your Gmail so Exodo can find transaction alerts for your review.'}
      </p>
      {status !== 'loading' && (
        <Button asChild variant="outline" className="mt-5 text-xs font-bold text-muted">
          <a href="/api/gmail/connect">
            <EnvelopeSimple size={17} /> {connected ? 'Reconnect Gmail' : 'Connect Gmail'}
          </a>
        </Button>
      )}
    </section>
  )
}
