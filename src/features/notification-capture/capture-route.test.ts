import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '../../app/api/notifications/capture/route'
import { createCaptureStore } from './capture-store'
import { MAX_CAPTURE_BYTES } from './contract'
import { captureFixture as capture } from './test-fixture'

vi.mock('./capture-store', () => ({ createCaptureStore: vi.fn() }))
const credential = 'synthetic-test-credential-never-use-in-production'
const persist = vi.fn()
const log = vi.spyOn(console, 'error').mockImplementation(() => {})

function request(
  body: string | Uint8Array = JSON.stringify(capture),
  authorization = `Bearer ${credential}`,
  type = 'application/json',
) {
  return new Request('https://exodo.test/api/notifications/capture', {
    method: 'POST',
    headers: { Authorization: authorization, 'Content-Type': type },
    body: typeof body === 'string' ? body : Buffer.from(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('EXODO_SHORTCUT_TEST_TOKEN', credential)
  vi.stubEnv('EXODO_SHORTCUT_USER_ID', 'user_owner')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'server-only-test-key')
  vi.mocked(createCaptureStore).mockReturnValue(persist)
  persist.mockResolvedValue('stored')
})
afterEach(() => vi.unstubAllEnvs())

describe('deployed notification capture route', () => {
  it('passes mail type through to storage', async () => {
    const mail = { ...capture, type: 'mail' }
    expect((await POST(request(JSON.stringify(mail)))).status).toBe(200)
    expect(persist).toHaveBeenCalledWith(mail)
  })

  it('accepts older notification inputs without type', async () => {
    const { type: _type, ...legacy } = capture
    expect((await POST(request(JSON.stringify(legacy)))).status).toBe(200)
    expect(persist).toHaveBeenCalledWith(capture)
  })

  it('rejects unsupported types before persistence', async () => {
    expect((await POST(request(JSON.stringify({ ...capture, type: 'sms' })))).status).toBe(400)
    expect(persist).not.toHaveBeenCalled()
  })

  it('stores normalized content under the configured owner without a Clerk session', async () => {
    const response = await POST(request(JSON.stringify({ ...capture, version: '1', user_id: 'attacker' })))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ event_id: capture.event_id, accepted: true, durable: true })
    expect(createCaptureStore).toHaveBeenCalledExactlyOnceWith('user_owner')
    expect(persist).toHaveBeenCalledExactlyOnceWith(capture)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    const bodyLog = log.mock.calls
      .map((call) => JSON.parse(call[1] as string))
      .find((entry) => entry.event === 'request_body')
    expect(bodyLog.request_id).toBe(response.headers.get('X-Request-ID'))
    expect(JSON.parse(bodyLog.body).message).toBe(capture.message)
    expect(JSON.stringify(log.mock.calls)).not.toContain(credential)
  })

  it('waits for committed storage before returning durable acceptance', async () => {
    let finish!: (result: 'stored') => void
    persist.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    let responded = false
    const pending = POST(request()).then((response) => {
      responded = true
      return response
    })
    await vi.waitFor(() => expect(persist).toHaveBeenCalled())
    expect(responded).toBe(false)
    finish('stored')
    expect((await pending).status).toBe(200)
  })

  it.each(['', 'Bearer wrong', `Basic ${credential}`])(
    'rejects invalid authorization %s before reading or writing',
    async (authorization) => {
      const response = await POST(request('{invalid', authorization))
      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ accepted: false, durable: false, error: 'unauthorized' })
      expect(createCaptureStore).not.toHaveBeenCalled()
    },
  )

  it.each([
    'EXODO_SHORTCUT_TEST_TOKEN',
    'EXODO_SHORTCUT_USER_ID',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ])('fails closed without %s', async (name) => {
    vi.stubEnv(name, '')
    const response = await POST(request())
    expect(response.status).toBe(503)
    expect((await response.json()).error).toBe('receiver_not_configured')
    expect(persist).not.toHaveBeenCalled()
  })

  it.each(['{invalid', 'null', '[]', JSON.stringify({ ...capture, captured_at: '' })])(
    'rejects invalid JSON/schema %#',
    async (body) => {
      const response = await POST(request(body))
      expect(response.status).toBe(400)
      expect((await response.json()).durable).toBe(false)
      expect(persist).not.toHaveBeenCalled()
    },
  )

  it('rejects invalid UTF-8', async () => {
    expect((await POST(request(new Uint8Array([0xff])))).status).toBe(400)
    expect(persist).not.toHaveBeenCalled()
  })

  it('caps body reads/logging and rejects oversized requests before storage', async () => {
    const response = await POST(request('x'.repeat(MAX_CAPTURE_BYTES + 1)))
    expect(response.status).toBe(413)
    expect(persist).not.toHaveBeenCalled()
    const bodyLog = log.mock.calls
      .map((call) => JSON.parse(call[1] as string))
      .find((entry) => entry.event === 'request_body')
    expect(bodyLog.body).toHaveLength(MAX_CAPTURE_BYTES)
    expect(bodyLog.truncated).toBe(true)
  })

  it('requires JSON content type', async () => {
    expect((await POST(request('{}', `Bearer ${credential}`, 'text/plain'))).status).toBe(415)
    expect(persist).not.toHaveBeenCalled()
  })

  it.each(['conflict', 'failure'])('retains captures on %s', async (result) => {
    if (result === 'conflict') persist.mockResolvedValue('conflict')
    else persist.mockRejectedValue(new Error('secret-database-details'))
    const response = await POST(request())
    expect(response.status).toBe(result === 'conflict' ? 409 : 503)
    expect((await response.json()).durable).toBe(false)
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret-database-details')
  })
})
