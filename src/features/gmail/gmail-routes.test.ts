import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { auth } from '@clerk/nextjs/server'
import { listGmailMessages, readGmailMessage } from './gmail-messages'
import { getGmailConnection } from './gmail-service'
import { GET as list } from '@/app/api/gmail/messages/route'
import { GET as read } from '@/app/api/gmail/messages/[id]/route'

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))
vi.mock('./gmail-messages', () => ({ listGmailMessages: vi.fn(), readGmailMessage: vi.fn() }))
vi.mock('./gmail-service', () => ({ getGmailConnection: vi.fn() }))
beforeEach(() => {
  vi.mocked(getGmailConnection).mockResolvedValue({ email: 'mailbox@example.com', lastImportedAt: null })
  vi.mocked(auth).mockResolvedValue({ userId: 'owner' } as Awaited<ReturnType<typeof auth>>)
})
afterEach(() => vi.resetAllMocks())

describe('Gmail read route authorization', () => {
  it('reads emails directly from Gmail and leaves responses uncached', async () => {
    vi.mocked(listGmailMessages).mockResolvedValue({ messages: [], nextPageToken: null })
    await list(new Request('https://exodo.test/api/gmail/messages', { headers: { 'Cache-Control': 'no-cache' } }))
    expect(listGmailMessages).toHaveBeenCalledExactlyOnceWith('owner', undefined, null)
  })
  it('rejects disconnected mailboxes before reading email', async () => {
    vi.mocked(getGmailConnection).mockResolvedValue(null)
    expect((await list(new Request('https://exodo.test/api/gmail/messages'))).status).toBe(409)
    expect((await read(new Request('https://exodo.test'), { params: Promise.resolve({ id: 'abc' }) })).status).toBe(409)
    expect(listGmailMessages).not.toHaveBeenCalled()
    expect(readGmailMessage).not.toHaveBeenCalled()
  })
  it('rejects signed-out requests before reading any email', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>)
    expect((await list(new Request('https://exodo.test/api/gmail/messages'))).status).toBe(401)
    expect((await read(new Request('https://exodo.test'), { params: Promise.resolve({ id: 'abc' }) })).status).toBe(401)
    expect(listGmailMessages).not.toHaveBeenCalled()
    expect(readGmailMessage).not.toHaveBeenCalled()
  })
  it('reads messages using the signed-in user identity', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'signed-in-user' } as Awaited<ReturnType<typeof auth>>)
    vi.mocked(readGmailMessage).mockResolvedValue({ id: 'abc' } as Awaited<ReturnType<typeof readGmailMessage>>)
    const response = await read(new Request('https://exodo.test'), { params: Promise.resolve({ id: 'abc' }) })
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(readGmailMessage).toHaveBeenCalledWith('signed-in-user', 'abc')
  })
  it('preserves pagination and leaves HTTP responses uncached', async () => {
    vi.mocked(listGmailMessages).mockResolvedValue({ messages: [], nextPageToken: 'older' })
    const response = await list(new Request('https://exodo.test/api/gmail/messages?pageToken=next%2Bpage'))
    expect(listGmailMessages).toHaveBeenCalledWith('owner', 'next+page', null)
    expect(await response.json()).toEqual({ messages: [], nextPageToken: 'older' })
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  })
  it('reads the current import boundary for the Gmail request', async () => {
    vi.mocked(listGmailMessages).mockResolvedValue({ messages: [], nextPageToken: null })
    vi.mocked(getGmailConnection).mockResolvedValueOnce({
      email: 'mailbox@example.com',
      lastImportedAt: '2026-09-27T07:00:00.000Z',
    })
    await list(new Request('https://exodo.test/api/gmail/messages'))
    expect(getGmailConnection).toHaveBeenCalledExactlyOnceWith('owner')
    expect(listGmailMessages).toHaveBeenCalledExactlyOnceWith('owner', undefined, '2026-09-27T07:00:00.000Z')
  })
  it('returns a reconnection action for expired permission', async () => {
    vi.mocked(listGmailMessages).mockRejectedValue({ response: { status: 400, data: { error: 'invalid_grant' } } })
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
    expect(readGmailMessage).not.toHaveBeenCalled()
    expect(listGmailMessages).not.toHaveBeenCalled()
  })
})
