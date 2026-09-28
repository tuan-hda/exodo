import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { connectGmail, getGmailClient, getGmailConnection } from './gmail-service'
import { decryptGoogleToken, encryptGoogleToken } from '@/lib/google/token-encryption'

const mocks = vi.hoisted(() => ({
  read: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
  getToken: vi.fn(),
  getAccessToken: vi.fn(),
  setCredentials: vi.fn(),
  credentials: {} as { refresh_token?: string; expiry_date?: number },
}))
vi.mock('@/lib/supabase-admin', () => ({
  createAdminSupabaseClient: () => ({
    from: () => ({
      select: (columns: string) => {
        mocks.select(columns)
        return {
          eq: (column: string, value: string) => {
            mocks.eq(column, value)
            return { maybeSingle: mocks.read }
          },
        }
      },
      upsert: mocks.upsert,
      update: (value: unknown) => {
        mocks.update(value)
        return { eq: () => ({ eq: () => ({ eq: async () => ({ error: null }) }) }) }
      },
    }),
  }),
}))
vi.mock('./gmail-api', () => ({
  GmailDisconnectedError: class extends Error {},
  createGmailOAuthClient: () => ({
    getToken: mocks.getToken,
    getAccessToken: mocks.getAccessToken,
    setCredentials: mocks.setCredentials,
    credentials: mocks.credentials,
  }),
  createGmailApi: () => ({ users: { getProfile: async () => ({ data: { emailAddress: 'owner@example.com' } }) } }),
}))
const user = 'user_123'
const email = 'owner@example.com'
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('GOOGLE_TOKEN_ENCRYPTION_KEY', Buffer.alloc(32, 7).toString('base64'))
  mocks.credentials = {}
  mocks.read.mockResolvedValue({ data: null, error: null })
  mocks.upsert.mockResolvedValue({ error: null })
  mocks.getToken.mockResolvedValue({ tokens: { access_token: 'access', refresh_token: 'refresh-secret' } })
  mocks.getAccessToken.mockResolvedValue({ token: 'access' })
})
afterEach(() => vi.unstubAllEnvs())

it('reads the mailbox and import boundary together without selecting tokens', async () => {
  mocks.read.mockResolvedValue({
    data: { google_email: email, last_imported_at: '2026-09-27T07:00:00+00:00' },
    error: null,
  })
  expect(await getGmailConnection(user)).toEqual({ email, lastImportedAt: '2026-09-27T07:00:00.000Z' })
  expect(mocks.select).toHaveBeenCalledExactlyOnceWith('google_email,last_imported_at')
  expect(mocks.eq).toHaveBeenCalledExactlyOnceWith('user_id', user)
  expect(mocks.read).toHaveBeenCalledTimes(1)
})

it('returns no connection for a missing row and no boundary before the first import', async () => {
  expect(await getGmailConnection(user)).toBeNull()
  mocks.read.mockResolvedValue({ data: { google_email: email, last_imported_at: null }, error: null })
  expect(await getGmailConnection(user)).toEqual({ email, lastImportedAt: null })
})

it('saves the OAuth refresh token only as ciphertext', async () => {
  await connectGmail(user, 'code')
  const saved = mocks.upsert.mock.calls[0][0]
  expect(saved.refresh_token).not.toContain('refresh-secret')
  expect(decryptGoogleToken(saved.refresh_token, user, email)).toBe('refresh-secret')
})

it('preserves the import timestamp when reconnecting the same mailbox', async () => {
  mocks.read.mockResolvedValue({ data: { google_email: email }, error: null })
  await connectGmail(user, 'code')
  expect(mocks.upsert.mock.calls[0][0]).not.toHaveProperty('last_imported_at')
})

it('clears the import timestamp when connecting a different mailbox', async () => {
  mocks.read.mockResolvedValue({ data: { google_email: 'previous@example.com' }, error: null })
  await connectGmail(user, 'code')
  expect(mocks.upsert.mock.calls[0][0]).toHaveProperty('last_imported_at', null)
})

it('decrypts for Google and encrypts a rotated token before saving', async () => {
  const encrypted = encryptGoogleToken('refresh-secret', user, email)
  mocks.read.mockResolvedValue({ data: { google_email: email, refresh_token: encrypted }, error: null })
  mocks.getAccessToken.mockImplementation(async () => {
    mocks.credentials.refresh_token = 'rotated-secret'
    return { token: 'access' }
  })
  await getGmailClient(user)
  expect(mocks.setCredentials).toHaveBeenCalledWith({ refresh_token: 'refresh-secret' })
  const saved = mocks.update.mock.calls[0][0]
  expect(saved.refresh_token).not.toContain('rotated-secret')
  expect(decryptGoogleToken(saved.refresh_token, user, email)).toBe('rotated-secret')
})

it('rejects plaintext without migrating or sending it to Google', async () => {
  mocks.read.mockResolvedValue({ data: { google_email: email, refresh_token: 'plaintext' }, error: null })
  await expect(getGmailClient(user)).rejects.toThrow('Could not decrypt')
  expect(mocks.getAccessToken).not.toHaveBeenCalled()
  expect(mocks.setCredentials).not.toHaveBeenCalled()
  expect(mocks.update).not.toHaveBeenCalled()
})
