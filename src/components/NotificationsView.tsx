'use client'

import { Bell, EnvelopeSimple } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

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
    <section className="notifications-view">
      <div className="notifications-icon">
        <Bell size={24} weight="regular" />
      </div>
      <p className="eyebrow">inbox</p>
      <h1>{connected ? 'Gmail is connected.' : 'Connect your Gmail.'}</h1>
      <p>
        {connected
          ? `Transaction alerts from ${gmailEmail} will appear here for you to name, categorize, and approve.`
          : 'Connect your Gmail so Exodo can find transaction alerts for your review.'}
      </p>
      {status !== 'loading' && (
        <a href="/api/gmail/connect" className="notifications-connect">
          <EnvelopeSimple size={17} /> {connected ? 'Reconnect Gmail' : 'Connect Gmail'}
        </a>
      )}
    </section>
  )
}
