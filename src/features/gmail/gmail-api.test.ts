import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createGmailOAuthClient,
  createGmailApi,
  gmailErrorStatus,
  isGmailGrantExpired,
  gmailErrorLogDetails,
} from './gmail-api'
import { createGmailAuthorizationUrl } from './gmail-service'
import { gmailRouteError } from './gmail-route-error'

beforeEach(() => {
  vi.stubEnv('GOOGLE_CLIENT_ID', 'test-client')
  vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-secret')
  vi.stubEnv('GOOGLE_REDIRECT_URI', 'https://exodo.test/api/gmail/callback')
})
afterEach(() => vi.unstubAllEnvs())

describe('official Gmail client configuration', () => {
  it('logs only an allowlisted category and HTTP status, never SDK request details', () => {
    const error = {
      message: 'Sensitive message',
      config: { data: { code: 'secret-code', client_secret: 'secret-client' } },
      response: { status: 400, data: { error: 'invalid_grant', refresh_token: 'secret-token' } },
    }
    expect(gmailErrorLogDetails(error)).toEqual({ category: 'oauth_grant_expired', status: 400 })
    expect(gmailErrorLogDetails(new Error('secret-value'))).toEqual({ category: 'application_error', status: null })
    expect(gmailErrorLogDetails({ response: { status: 'secret-value' } })).toEqual({
      category: 'application_error',
      status: null,
    })
    expect(gmailErrorLogDetails({ response: { status: 999 } })).toEqual({ category: 'application_error', status: null })
    expect(gmailErrorLogDetails({ response: { status: 503 } })).toEqual({ category: 'upstream_error', status: 503 })
  })
  it('uses Google OAuth to request read-only offline access with the callback and state', () => {
    const url = createGmailAuthorizationUrl('request-state')!
    expect(url.searchParams.get('client_id')).toBe('test-client')
    expect(url.searchParams.get('redirect_uri')).toBe('https://exodo.test/api/gmail/callback')
    expect(url.searchParams.get('scope')).toBe('https://www.googleapis.com/auth/gmail.readonly')
    expect(url.searchParams.get('access_type')).toBe('offline')
    expect(url.searchParams.get('state')).toBe('request-state')
    expect(url.searchParams.get('prompt')).toBe('consent')
  })
  it('creates the official Gmail API client and rejects missing OAuth configuration', () => {
    const api = createGmailApi(createGmailOAuthClient())
    expect(typeof api.users.messages.list).toBe('function')
    expect(typeof api.users.messages.get).toBe('function')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '')
    expect(() => createGmailOAuthClient()).toThrow('not configured')
    expect(createGmailAuthorizationUrl('state')).toBeNull()
  })
  it('recognizes SDK permission expiry without exposing Google response details', async () => {
    const error = { response: { status: 400, data: { error: 'invalid_grant', error_description: 'Sensitive detail' } } }
    expect(isGmailGrantExpired(error)).toBe(true)
    expect(gmailErrorStatus(error)).toBe(400)
    const response = gmailRouteError(error)
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      error: 'Gmail access has expired. Reconnect Gmail to read your emails.',
      reconnect: true,
    })
  })
})
