import type { CaptureEvent } from './contract'

export const captureFixture: CaptureEvent = {
  version: 1,
  event_id: 'synthetic-capture-001',
  device_id: 'synthetic-iphone-001',
  source_app: 'techcombank',
  title: 'Synthetic notification',
  subtitle: '',
  message: 'Synthetic test: Unicode đ, "quotes", and a newline\nNo real transaction.',
  captured_at: '2026-10-11T10:00:00+07:00',
}
