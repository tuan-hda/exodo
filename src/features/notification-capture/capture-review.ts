import type { Entry } from '@/features/entries/types'
import type { CaptureInboxItem } from './capture-inbox'

export type ReviewCapture = CaptureInboxItem & {
  name: string
  category: string
  divided: boolean
}

export function captureKey(capture: Pick<CaptureInboxItem, 'device_id' | 'event_id'>) {
  return JSON.stringify([capture.device_id, capture.event_id])
}

export function prepareCapture(capture: CaptureInboxItem): ReviewCapture {
  return {
    ...capture,
    name: capture.transaction?.title ?? '',
    category: capture.transaction?.category ?? ((capture.transaction?.amount ?? 0) > 0 ? 'Income' : 'Dining'),
    divided: false,
  }
}

export function reviewAmount(capture: ReviewCapture) {
  const amount = capture.transaction?.amount ?? null
  return amount !== null && capture.divided ? Math.sign(amount) * Math.round(Math.abs(amount) / 2) : amount
}

export function captureSourceTime(capture: Pick<CaptureInboxItem, 'captured_at' | 'received_at'>) {
  const value = capture.captured_at
  const original = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    ? Date.parse(value)
    : NaN
  return Number.isFinite(original) ? original : Date.parse(capture.received_at)
}

export function captureEntry(capture: ReviewCapture): Entry | null {
  const amount = reviewAmount(capture)
  if (amount === null || amount === 0 || !Number.isSafeInteger(amount)) return null
  const date = new Date(capture.transaction?.occurredAt ?? capture.captured_at)
  const effectiveDate = Number.isFinite(date.getTime()) ? date : new Date(capture.received_at)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(effectiveDate)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? ''
  return {
    id: crypto.randomUUID(),
    type: amount > 0 ? 'income' : 'expense',
    amount: Math.abs(amount),
    occurredAt: `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}`,
    title: capture.name.trim(),
    category: capture.category,
  }
}
