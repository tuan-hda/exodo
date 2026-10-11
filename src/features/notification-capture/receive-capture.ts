import { timingSafeEqual } from 'node:crypto'
import { captureValidationIssues, parseCapture } from './contract'
import type { PersistCapture } from './capture-store'

export function isCaptureCredential(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{32,256}$/.test(value)
}

export function hasCaptureAuthorization(authorization: string | null | undefined, credential: string) {
  const actual = Buffer.from(authorization ?? '')
  const expected = Buffer.from(`Bearer ${credential}`)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export type CaptureResult = {
  status: number
  body: { event_id?: string; accepted: boolean; durable: boolean; error?: string }
  details?: object
}

export async function receiveCapture(bytes: Uint8Array, persist: PersistCapture): Promise<CaptureResult> {
  const reject = (status: number, error: string, details: object): CaptureResult => ({
    status,
    body: { accepted: false, durable: false, error },
    details,
  })
  let text: string
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return reject(400, 'invalid_payload', { stage: 'utf8_decode', hint: 'Body must be valid UTF-8' })
  }
  let payload: unknown
  try {
    payload = JSON.parse(text)
  } catch {
    return reject(400, 'invalid_payload', { stage: 'json_decode', hint: 'Send a JSON object, not malformed text' })
  }
  const issues = captureValidationIssues(payload)
  if (issues.length > 0) return reject(400, 'invalid_payload', { stage: 'schema_validation', issues })
  const capture = parseCapture(payload)
  try {
    if ((await persist(capture)) !== 'stored') {
      return reject(409, 'event_conflict', {
        stage: 'persistence',
        hint: 'The same device/event ID already belongs to a different payload',
      })
    }
  } catch {
    return reject(503, 'storage_failed', {
      stage: 'persistence',
      hint: 'Check Supabase configuration, notification_captures migration, and database connectivity; keep the local file for retry',
    })
  }
  return { status: 200, body: { event_id: capture.event_id, accepted: true, durable: true } }
}
