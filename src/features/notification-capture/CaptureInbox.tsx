'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StateMessage } from '@/components/StateMessage'
import type { CaptureInboxPage } from './capture-inbox'
import { CaptureReviewRow } from './CaptureReviewRow'
import { captureKey, captureSourceTime, prepareCapture, reviewAmount, type ReviewCapture } from './capture-review'
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

export function CaptureInbox({ onImported }: { onImported: () => Promise<unknown> }) {
  const [captures, setCaptures] = useState<ReviewCapture[]>([])
  const [deselected, setDeselected] = useState<Set<string>>(() => new Set())
  const [importing, setImporting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const requestRef = useRef<AbortController | null>(null)
  const failedOffset = useRef(0)

  const load = useCallback(async (offset = 0) => {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    failedOffset.current = offset
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/notifications/captures?offset=${offset}`, {
        cache: 'no-store',
        signal: controller.signal,
      })
      if (!response.ok) throw new Error('Could not load captures. Please try again.')
      const page: CaptureInboxPage = await response.json()
      if (controller.signal.aborted) return
      setCaptures((current) =>
        offset === 0
          ? page.captures.map(prepareCapture)
          : [
              ...current,
              ...page.captures
                .map(prepareCapture)
                .filter(
                  (capture) =>
                    !current.some((item) => item.device_id === capture.device_id && item.event_id === capture.event_id),
                ),
            ],
      )
      setNextOffset(page.nextOffset)
      if (offset === 0) setDeselected(new Set())
    } catch {
      if (!controller.signal.aborted) setError('Could not load captures. Please try again.')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    return () => requestRef.current?.abort()
  }, [load])

  const selectable = captures.filter((capture) => capture.transaction !== null)
  const selected = selectable.filter((capture) => !deselected.has(captureKey(capture)))
  const invalidAmount = selected.some((capture) => !reviewAmount(capture))
  const allSelected = selectable.length > 0 && selected.length === selectable.length
  const busy = loading || importing
  const cutoff = selected.reduce((latest, capture) => {
    return Math.max(latest, captureSourceTime(capture))
  }, 0)

  function toggle(capture: ReviewCapture) {
    const key = captureKey(capture)
    setDeselected((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function importSelected() {
    if (busy || invalidAmount || selected.length === 0 || selected.length > 200) return
    setImporting(true)
    setNotice('')
    setError('')
    let saved = false
    try {
      const response = await fetch('/api/notifications/captures/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selected.map((capture) => ({
            device_id: capture.device_id,
            event_id: capture.event_id,
            name: capture.name,
            category: capture.category,
            divided: capture.divided,
          })),
        }),
      })
      if (!response.ok) throw new Error('Import failed. Refresh the inbox before retrying.')
      const receipt = await response.json()
      saved = true
      setNotice(`${receipt.imported} transactions added. ${receipt.deleted} captures deleted through the cutoff.`)
      await onImported()
    } catch {
      setNotice(
        saved
          ? 'Transactions saved and captures deleted. Refresh your records to see the changes.'
          : 'Import could not be confirmed. Refresh the inbox before retrying.',
      )
    } finally {
      await load()
      setImporting(false)
    }
  }

  return (
    <section className="grid min-w-0 gap-4" aria-label="Captured inbox" aria-busy={busy}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="ui-eyebrow">Captures</p>
          <p className="mt-1 text-sm text-muted">Saved notifications and emails</p>
        </div>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Refresh captures"
          disabled={busy}
          onClick={() => void load()}>
          <ArrowClockwise size={18} />
        </Button>
      </div>
      {notice && <StateMessage>{notice}</StateMessage>}
      {invalidAmount && (
        <StateMessage tone="danger">Deselect transactions without a valid amount before adding the rest.</StateMessage>
      )}
      {selected.length > 200 && <StateMessage tone="danger">Select at most 200 transactions per import.</StateMessage>}
      {error && (
        <div className="grid gap-3">
          <StateMessage tone="danger">{error}</StateMessage>
          <Button variant="secondary" disabled={busy} onClick={() => void load(failedOffset.current)}>
            Try again
          </Button>
        </div>
      )}
      {loading && captures.length === 0 && (
        <div className="grid gap-4" role="status" aria-label="Loading captures">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-24 w-full" />
          ))}
        </div>
      )}
      {!loading && !error && captures.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">No captures yet.</p>
      )}
      {selectable.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="size-5 accent-ink"
              checked={allSelected}
              disabled={busy}
              ref={(input) => {
                if (input) input.indeterminate = selected.length > 0 && !allSelected
              }}
              onChange={() => setDeselected(allSelected ? new Set(selectable.map(captureKey)) : new Set())}
            />
            Select all loaded
          </label>
          <span className="text-xs text-muted" role="status" aria-live="polite">
            {selected.length} selected
          </span>
        </div>
      )}
      <ul className="m-0 min-w-0 list-none p-0">
        {captures.map((capture) => (
          <CaptureReviewRow
            key={captureKey(capture)}
            capture={capture}
            selected={!deselected.has(captureKey(capture))}
            disabled={busy}
            onToggle={() => toggle(capture)}
            onChange={(changes) =>
              setCaptures((current) =>
                current.map((item) => (captureKey(item) === captureKey(capture) ? { ...item, ...changes } : item)),
              )
            }
          />
        ))}
      </ul>
      {nextOffset !== null && (
        <Button variant="outline" disabled={busy} onClick={() => void load(nextOffset)}>
          {loading ? 'Loading…' : 'Load older captures'}
        </Button>
      )}
      {selectable.length > 0 && (
        <Button
          disabled={busy || invalidAmount || selected.length === 0 || selected.length > 200}
          onClick={() => setConfirmOpen(true)}>
          {importing ? 'Adding…' : `Add selected (${selected.length})`}
        </Button>
      )}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add selected transactions?</AlertDialogTitle>
            <AlertDialogDescription>
              Save {selected.length} selected transactions. All captures at or before{' '}
              {new Date(cutoff).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} (Vietnam time) will be
              permanently deleted, including deselected, unrecognized, and unloaded captures. The cutoff uses original
              email/notification time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={importing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy || invalidAmount || selected.length === 0 || selected.length > 200}
              onClick={(event) => {
                event.preventDefault()
                setConfirmOpen(false)
                void importSelected()
              }}>
              Add and delete through cutoff
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
