import { afterEach, expect, it, vi } from 'vitest'
import { GET as callback } from '@/app/api/gmail/callback/route'
import { GET as status } from '@/app/api/gmail/status/route'
import { connectGmail, getGmailConnection } from './gmail-service'

vi.mock('@clerk/nextjs/server', () => ({ auth: async () => ({ userId: 'user' }) }))
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: 'state.user' }), delete: vi.fn() }),
}))
vi.mock('./gmail-service', () => ({
  connectGmail: vi.fn(),
  getGmailConnection: vi.fn(),
  gmailOAuthStateCookie: 'oauth_state',
}))
afterEach(() => {
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

it('redirects after successfully reconnecting Gmail', async () => {
  const response = await callback(new Request('https://exodo.test/api/gmail/callback?state=state&code=code'))
  expect(response.headers.get('Location')).toContain('gmail=connected')
})

it('keeps OAuth codes, tokens and SDK request configuration out of callback logs', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.mocked(connectGmail).mockRejectedValue({
    config: { data: { code: 'secret-code', refresh_token: 'secret-token' } },
    response: { status: 400, data: { error: 'invalid_grant', error_description: 'secret-details' } },
  })
  const response = await callback(new Request('https://exodo.test/api/gmail/callback?state=state&code=secret-code'))
  expect(response.status).toBe(307)
  expect(log).toHaveBeenCalledExactlyOnceWith('Failed to connect Gmail', {
    category: 'oauth_grant_expired',
    status: 400,
  })
})

it('keeps database error messages and details out of status logs', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.mocked(getGmailConnection).mockRejectedValue({
    message: 'secret-message',
    details: 'private-data',
    code: 'PGRST205',
  })
  const response = await status()
  expect(response.status).toBe(500)
  expect(log).toHaveBeenCalledExactlyOnceWith('Failed to check Gmail connection status', {
    category: 'application_error',
    status: null,
  })
  expect(await response.json()).toEqual({ connected: false })
})

it('preserves the status response when the connection includes an import boundary', async () => {
  vi.mocked(getGmailConnection).mockResolvedValue({
    email: 'owner@example.com',
    lastImportedAt: '2026-09-27T07:00:00.000Z',
  })
  expect(await (await status()).json()).toEqual({ connected: true, email: 'owner@example.com' })
})
