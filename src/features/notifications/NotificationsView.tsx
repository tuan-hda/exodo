'use client'

import { ArrowClockwise, EnvelopeSimple } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { PageShell } from '@/components/PageShell'
import { StateMessage } from '@/components/StateMessage'
import { Button } from '@/components/ui/button'
import { parseGmailStatus } from '@/features/gmail/types'
import { updateSearchParams } from '@/features/navigation/navigation'
import { GmailInbox } from '@/features/gmail/GmailInbox'
import type { Entry } from '@/features/entries/types'

type GmailStatus = 'loading' | 'connected' | 'disconnected' | 'unavailable' | 'error'

export function NotificationsView({
  onSaveEntries,
  isSaving,
}: {
  onSaveEntries: (entries: Entry[]) => Promise<boolean>
  isSaving: boolean
}) {
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
          setError('Gmail access is unavailable. Try again.')
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
  const hasError = status === 'error' || status === 'unavailable'
  const errorMessage = error || (notice === 'error' ? 'Gmail connection failed. Try again.' : '')
  return (
    <PageShell size={connected ? 'wide' : 'centered'} aria-busy={isLoading}>
      {connected && <GmailInbox key={gmailEmail} onSaveEntries={onSaveEntries} isSaving={isSaving} />}
      <div className="mt-20 grid min-h-40 w-full content-center justify-items-center gap-4 rounded-panel border border-line bg-surface p-8 shadow-panel max-md:min-h-32 max-md:p-6">
        {isLoading ? (
          <Button variant="secondary" disabled>
            Checking Gmail…
          </Button>
        ) : hasError ? (
          <Button variant="secondary" type="button" onClick={() => setRetryKey((key) => key + 1)}>
            <ArrowClockwise size={17} /> Try again
          </Button>
        ) : (
          <Button asChild variant="secondary">
            <a href="/api/gmail/connect">
              <EnvelopeSimple size={17} /> {connected ? 'Reconnect Gmail' : 'Connect Gmail'}
            </a>
          </Button>
        )}
        {errorMessage && <StateMessage tone="danger">{errorMessage}</StateMessage>}
      </div>
    </PageShell>
  )
}
