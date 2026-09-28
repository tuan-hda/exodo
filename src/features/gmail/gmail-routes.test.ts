import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { auth } from '@clerk/nextjs/server'
import { getCachedGmailMessages, getCachedGmailMessage, invalidateGmailCache } from './gmail-cache'
import { getGmailConnection } from './gmail-service'
import { GET as list } from '@/app/api/gmail/messages/route'
import { GET as read } from '@/app/api/gmail/messages/[id]/route'

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))
vi.mock('./gmail-cache', () => ({
  getCachedGmailMessages: vi.fn(),
  getCachedGmailMessage: vi.fn(),
  invalidateGmailCache: vi.fn(),
}))
vi.mock('./gmail-service', () => ({ getGmailConnection: vi.fn() }))
beforeEach(() => {
  vi.mocked(getGmailConnection).mockResolvedValue({ email: 'mailbox@example.com', lastImportedAt: null })
  vi.mocked(auth).mockResolvedValue({ userId: 'owner' } as Awaited<ReturnType<typeof auth>>)
})
afterEach(() => vi.resetAllMocks())

describe('Gmail read route authorization', () => {
  it('invalidates only the authenticated user cache on explicit refresh', async () => {
    vi.mocked(getCachedGmailMessages).mockResolvedValue({ messages: [], nextPageToken: null })
    await list(new Request('https://exodo.test/api/gmail/messages?refresh=1'))
    expect(invalidateGmailCache).toHaveBeenCalledExactlyOnceWith('owner')
    expect(vi.mocked(invalidateGmailCache).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(getCachedGmailMessages).mock.invocationCallOrder[0],
    )
  })
  it('does not explicitly invalidate tags for a request no-cache header', async () => {
    vi.mocked(getCachedGmailMessages).mockResolvedValue({ messages: [], nextPageToken: null })
    await list(new Request('https://exodo.test/api/gmail/messages', { headers: { 'Cache-Control': 'no-cache' } }))
    expect(invalidateGmailCache).not.toHaveBeenCalled()
  })
  it('rejects disconnected mailboxes before returning cached data', async () => {
    vi.mocked(getGmailConnection).mockResolvedValue(null)
    expect((await list(new Request('https://exodo.test/api/gmail/messages?refresh=1'))).status).toBe(409)
    expect((await read(new Request('https://exodo.test'), { params: Promise.resolve({ id: 'abc' }) })).status).toBe(409)
    expect(getCachedGmailMessages).not.toHaveBeenCalled()
    expect(getCachedGmailMessage).not.toHaveBeenCalled()
    expect(invalidateGmailCache).not.toHaveBeenCalled()
  })
  it('rejects signed-out requests before reading any email', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>)
    expect((await list(new Request('https://exodo.test/api/gmail/messages'))).status).toBe(401)
    expect((await read(new Request('https://exodo.test'), { params: Promise.resolve({ id: 'abc' }) })).status).toBe(401)
    expect(getCachedGmailMessages).not.toHaveBeenCalled()
    expect(getCachedGmailMessage).not.toHaveBeenCalled()
  })
  it('reads messages using the signed-in user identity', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'signed-in-user' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(getCachedGmailMessage).mockResolvedValue({ id: 'abc' } as Awaited<
      ReturnType<typeof getCachedGmailMessage>
    >)
    const response = await read(new Request('https://exodo.test'), { params: Promise.resolve({ id: 'abc' }) })
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(getCachedGmailMessage).toHaveBeenCalledWith('signed-in-user', 'mailbox@example.com', 'abc')
  })
  it('preserves pagination and leaves HTTP responses uncached', async () => {
    vi.mocked(getCachedGmailMessages).mockResolvedValue({ messages: [], nextPageToken: 'older' })
    const response = await list(new Request('https://exodo.test/api/gmail/messages?pageToken=next%2Bpage'))
    expect(getCachedGmailMessages).toHaveBeenCalledWith('owner', 'mailbox@example.com', 'next+page', null)
    expect(await response.json()).toEqual({ messages: [], nextPageToken: 'older' })
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  })
  it('reads the current import boundary before each cached list lookup', async () => {
    vi.mocked(getCachedGmailMessages).mockResolvedValue({ messages: [], nextPageToken: null })
    vi.mocked(getGmailConnection).mockResolvedValueOnce({
      email: 'mailbox@example.com',
      lastImportedAt: '2026-09-27T07:00:00.000Z',
    })
    await list(new Request('https://exodo.test/api/gmail/messages'))
    expect(getGmailConnection).toHaveBeenCalledExactlyOnceWith('owner')
    expect(getCachedGmailMessages).toHaveBeenLastCalledWith(
      'owner',
      'mailbox@example.com',
      undefined,
      '2026-09-27T07:00:00.000Z',
    )
    vi.mocked(getGmailConnection).mockResolvedValueOnce({
      email: 'mailbox@example.com',
      lastImportedAt: '2026-09-28T07:00:00.000Z',
    })
    await list(new Request('https://exodo.test/api/gmail/messages'))
    expect(getCachedGmailMessages).toHaveBeenLastCalledWith(
      'owner',
      'mailbox@example.com',
      undefined,
      '2026-09-28T07:00:00.000Z',
    )
  })
  it('returns a reconnection action for expired permission', async () => {
    vi.mocked(getCachedGmailMessages).mockRejectedValue({ response: { status: 400, data: { error: 'invalid_grant' } } })
    const response = await list(new Request('https://exodo.test/api/gmail/messages'))
    expect(response.status).toBe(409)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect((await response.json()).reconnect).toBe(true)
  })
  it('rejects invalid message identifiers and overly long page tokens', async () => {
    expect(
      (await read(new Request('https://exodo.test'), { params: Promise.resolve({ id: '../profile' }) })).status,
    ).toBe(400)
    expect(
      (await list(new Request(`https://exodo.test/api/gmail/messages?pageToken=${'a'.repeat(2049)}`))).status,
    ).toBe(400)
    expect(getCachedGmailMessage).not.toHaveBeenCalled()
    expect(getCachedGmailMessages).not.toHaveBeenCalled()
  })
})
