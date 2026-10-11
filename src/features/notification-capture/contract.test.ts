import { describe, expect, it } from 'vitest'
import { parseCapture } from './contract'
import { captureFixture as capture } from './test-fixture'

describe('simple capture contract', () => {
  it.each(['notification', 'mail'] as const)('accepts type %s', (type) => {
    expect(parseCapture({ ...capture, type }).type).toBe(type)
  })

  it('defaults omitted type to notification for existing queued files', () => {
    const { type: _type, ...legacy } = capture
    expect(parseCapture(legacy)).toEqual(capture)
  })

  it.each(['sms', '', null, 1])('rejects unsupported type %j', (type) => {
    expect(() => parseCapture({ ...capture, type })).toThrow('Invalid capture payload')
  })

  it.each([1, '1'])('normalizes version %j and preserves notification text', (version) => {
    expect(parseCapture({ ...capture, version })).toEqual(capture)
  })

  it('defaults missing/null notification text and ignores extra fields', () => {
    const { title: _title, subtitle: _subtitle, message: _message, ...metadata } = capture
    expect(parseCapture({ ...metadata, title: null, extra: true })).toEqual({
      ...metadata,
      title: '',
      subtitle: '',
      message: '',
    })
  })

  it('preserves identifiers and capture times without format restrictions', () => {
    const payload = { ...capture, event_id: 'event / 001', device_id: 'My iPhone', captured_at: '11 Oct 2026 10:00' }
    expect(parseCapture(payload)).toEqual(payload)
  })

  it.each([
    null,
    [],
    { ...capture, version: 2 },
    { ...capture, version: true },
    { ...capture, event_id: '' },
    { ...capture, device_id: ' ' },
    { ...capture, source_app: null },
    { ...capture, captured_at: 123 },
    { ...capture, captured_at: '' },
    { ...capture, message: 123 },
  ])('rejects missing or incorrectly typed fields %#', (payload) => {
    expect(() => parseCapture(payload)).toThrow('Invalid capture payload')
  })
})
