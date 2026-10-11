import { isRecord } from '../../lib/guards'

export const MAX_CAPTURE_BYTES = 64 * 1024

export type CaptureEvent = {
  version: 1
  event_id: string
  device_id: string
  source_app: string
  title: string
  subtitle: string
  message: string
  captured_at: string
}

function isNonemptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isOptionalText(value: unknown): value is string | null | undefined {
  return value == null || typeof value === 'string'
}

export function captureValidationIssues(value: unknown): string[] {
  if (!isRecord(value)) return ['body must be a JSON object']
  const issues: string[] = []
  if (value.version !== 1 && value.version !== '1') issues.push('version must be 1 or "1"')
  for (const field of ['event_id', 'device_id', 'source_app', 'captured_at'] as const) {
    if (!isNonemptyText(value[field])) issues.push(`${field} must be a nonempty string`)
  }
  for (const field of ['title', 'subtitle', 'message'] as const) {
    if (!isOptionalText(value[field])) issues.push(`${field} must be a string, null, or omitted`)
  }
  return issues
}

export function parseCapture(value: unknown): CaptureEvent {
  if (!isRecord(value) || captureValidationIssues(value).length > 0) {
    throw new Error('Invalid capture payload')
  }
  const capture = value as CaptureEvent
  return {
    version: 1,
    event_id: capture.event_id,
    device_id: capture.device_id,
    source_app: capture.source_app,
    title: capture.title ?? '',
    subtitle: capture.subtitle ?? '',
    message: capture.message ?? '',
    captured_at: capture.captured_at,
  }
}
