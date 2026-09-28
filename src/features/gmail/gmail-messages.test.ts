import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { decodeMessage, decodeMessageSummary, listGmailMessages } from './gmail-messages'
import { getGmailClient } from './gmail-service'

vi.mock('./gmail-service', () => ({ getGmailClient: vi.fn() }))
afterEach(() => vi.resetAllMocks())

const part = (text: string, mimeType = 'text/plain') => ({
  mimeType,
  body: { data: Buffer.from(text).toString('base64url') },
})
const cakeHtml = readFileSync(new URL('./fixtures/cake-transaction.html', import.meta.url), 'utf8')
const message = (payload: Record<string, unknown> = part('Hello')) => ({
  id: 'message-1',
  threadId: 'thread-1',
  internalDate: '1790550000000',
  labelIds: ['INBOX', 'UNREAD'],
  snippet: 'Hello &amp; welcome',
  payload: {
    headers: [
      { name: 'From', value: 'Sender <sender@example.com>' },
      { name: 'Subject', value: 'Hello' },
      { name: 'To', value: 'owner@example.com' },
    ],
    ...payload,
  },
})

describe('reading Gmail messages', () => {
  it.each([false, true])('extracts the supplied Cake HTML with a plain-text alternative: %s', async (hasPlain) => {
    const email = await decodeMessage(
      message({
        mimeType: 'multipart/alternative',
        headers: [{ name: 'Subject', value: '[CAKE] Thông báo giao dịch thành công' }],
        parts: [
          ...(hasPlain ? [part('Cake xin thông báo tài khoản của bạn vừa mới phát sinh giao dịch.')] : []),
          part(cakeHtml, 'text/html'),
        ],
      }),
    )
    expect(email.transaction).toEqual({ source: 'cake', amount: -1846000, occurredAt: '2026-09-27T07:54:41.000Z' })
  })
  it('uses HTML to fill missing fields while preserving parsed plain-text fields', async () => {
    const email = await decodeMessage(
      message({
        mimeType: 'multipart/alternative',
        headers: [{ name: 'Subject', value: '[CAKE] Thông báo giao dịch thành công' }],
        parts: [part('Số tiền -21.000 đ'), part(cakeHtml, 'text/html')],
      }),
    )
    expect(email.transaction).toEqual({ source: 'cake', amount: -21000, occurredAt: '2026-09-27T07:54:41.000Z' })
    expect(email.body).toBe('Số tiền -21.000 đ')
  })
  it('prefers plain text within nested MIME parts and ignores file attachments', async () => {
    const email = await decodeMessage(
      message({
        mimeType: 'multipart/mixed',
        parts: [
          { mimeType: 'multipart/alternative', parts: [part('Xin chào'), part('<p>Duplicate</p>', 'text/html')] },
          { ...part('File content'), filename: 'notes.txt' },
        ],
      }),
    )
    expect(email).toMatchObject({
      body: 'Xin chào',
      recipient: 'owner@example.com',
      unread: true,
      snippet: 'Hello & welcome',
    })
  })
  it('converts HTML-only bodies into text without scripts, styles, or remote images', async () => {
    const email = await decodeMessage(
      message(
        part(
          '<script>steal()</script><style>.tracking{}</style><p>Hello &amp; welcome</p><img src="https://example.com/tracker">',
          'text/html',
        ),
      ),
    )
    expect(email.body).toBe('Hello & welcome')
  })
  it('extracts Cake fields from HTML tables with empty spacer cells', async () => {
    const email = await decodeMessage(
      message({
        ...part(
          `<table>
        <tr><td>Ngày giờ giao dịch</td><td></td><td>27/09/2026, 14:54:41</td></tr>
        <tr><td>Số tiền</td><td></td><td>-1.846.000 đ</td></tr>
        <tr><td>Phí giao dịch</td><td></td><td>0 đ</td></tr>
      </table>`,
          'text/html',
        ),
        headers: [{ name: 'Subject', value: '[CAKE] Thông báo giao dịch thành công' }],
      }),
    )
    expect(email.transaction).toEqual({ source: 'cake', amount: -1846000, occurredAt: '2026-09-27T07:54:41.000Z' })
  })
  it('decodes MIME encoded subjects and sender names', () => {
    const subject = `=?UTF-8?B?${Buffer.from('Xin chào').toString('base64')}?=`
    const email = decodeMessageSummary(
      message({
        headers: [
          { name: 'Subject', value: subject },
          { name: 'From', value: '=?utf-8?Q?Jos=C3=A9?= <sender@example.com>' },
        ],
      }),
    )
    expect(email.subject).toBe('Xin chào')
    expect(email.sender).toBe('José <sender@example.com>')
  })
  it('retrieves body parts held by Gmail as attachments', async () => {
    const readAttachment = vi.fn().mockResolvedValue({ data: Buffer.from('Large body').toString('base64url') })
    const email = await decodeMessage(
      message({ mimeType: 'text/plain', body: { attachmentId: 'body-id', size: 10 } }),
      readAttachment,
    )
    expect(email.body).toBe('Large body')
    expect(readAttachment).toHaveBeenCalledWith('body-id')
  })
  it('handles other character sets and rejects oversized bodies and invalid dates', async () => {
    const email = await decodeMessage(
      message({
        mimeType: 'text/plain',
        headers: [{ name: 'Content-Type', value: 'text/plain; charset=windows-1252' }],
        body: { data: Buffer.from([0x63, 0x61, 0x66, 0xe9]).toString('base64url') },
      }),
    )
    expect(email.body).toBe('café')
    await expect(
      decodeMessage(message({ mimeType: 'text/plain', body: { size: 2_000_001, data: '' } })),
    ).rejects.toThrow('too large')
    expect(() => decodeMessageSummary({ ...message(), internalDate: 'invalid' })).toThrow('received date')
  })
  it('passes the page token to the official client and tolerates deleted messages', async () => {
    const list = vi.fn().mockResolvedValue({
      data: { messages: [{ id: 'one' }, { id: 'two' }, { id: 'three' }], nextPageToken: 'older-page' },
    })
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: message({ headers: [{ name: 'Subject', value: 'VPBank - Thông báo biến động số dư/ Balance Changed' }] }),
      })
      .mockResolvedValueOnce({ data: { ...message(), id: 'unrelated' } })
      .mockRejectedValueOnce({ response: { status: 404 } })
    vi.mocked(getGmailClient).mockResolvedValue({ users: { messages: { list, get } } } as unknown as Awaited<
      ReturnType<typeof getGmailClient>
    >)
    const page = await listGmailMessages('user-1', 'page-token')
    expect(page.messages).toHaveLength(1)
    expect(page.nextPageToken).toBe('older-page')
    expect(list).toHaveBeenCalledWith(
      {
        userId: 'me',
        labelIds: ['INBOX'],
        q: 'subject:VPBank OR subject:CAKE',
        maxResults: 20,
        pageToken: 'page-token',
      },
      { timeout: 15000 },
    )
    expect(get).toHaveBeenCalledWith({ userId: 'me', id: 'one', format: 'full' }, { timeout: 15000 })
    expect(page.messages[0]).not.toHaveProperty('body')
  })
  it('limits both bank subjects by the received timestamp and excludes the imported boundary', async () => {
    const lastImportedAt = '2026-09-27T07:00:00.123Z'
    const list = vi.fn().mockResolvedValue({
      data: {
        messages: [{ id: 'old' }, { id: 'same-second' }, { id: 'boundary' }, { id: 'new' }],
        nextPageToken: 'older',
      },
    })
    const timestamp = Date.parse(lastImportedAt)
    const get = vi.fn().mockImplementation(async ({ id }: { id: string }) => ({
      data: {
        ...message({
          ...part('Số tiền -21.000 đ\nNgày giờ giao dịch 26/09/2026, 14:43:55'),
          headers: [{ name: 'Subject', value: '[CAKE] Thông báo giao dịch thành công' }],
        }),
        id,
        internalDate: String(
          { old: timestamp - 86400000, 'same-second': timestamp - 1, boundary: timestamp, new: timestamp + 1 }[id],
        ),
      },
    }))
    vi.mocked(getGmailClient).mockResolvedValue({ users: { messages: { list, get } } } as unknown as Awaited<
      ReturnType<typeof getGmailClient>
    >)
    const page = await listGmailMessages('user-1', 'next-page', lastImportedAt)
    expect(list).toHaveBeenCalledWith(
      {
        userId: 'me',
        labelIds: ['INBOX'],
        q: '(subject:VPBank OR subject:CAKE) after:1790492400',
        maxResults: 20,
        pageToken: 'next-page',
      },
      { timeout: 15000 },
    )
    expect(page.messages.map((item) => item.id)).toEqual(['new'])
    expect(page.nextPageToken).toBe('older')
    expect(page.messages[0].transaction?.occurredAt).toBe('2026-09-26T07:43:55.000Z')
  })
  it.each([
    '[CAKE] Thông báo giao dịch thành công',
    'VPBank xin thong bao bien dong so du The tin dung cua Quy khach – VPBank would like to inform your credit card’s balance change',
    'VPBank - Thông báo biến động số dư/ Balance Changed',
  ])('includes transaction subject %s without requiring a readable body', async (subject) => {
    const list = vi.fn().mockResolvedValue({ data: { messages: [{ id: 'one' }] } })
    const get = vi.fn().mockResolvedValue({
      data: message({
        headers: [{ name: 'Subject', value: `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=` }],
      }),
    })
    vi.mocked(getGmailClient).mockResolvedValue({ users: { messages: { list, get } } } as unknown as Awaited<
      ReturnType<typeof getGmailClient>
    >)
    expect((await listGmailMessages('user-1')).messages).toHaveLength(1)
  })
  it('retains pagination when every candidate is unrelated', async () => {
    const list = vi.fn().mockResolvedValue({ data: { messages: [{ id: 'one' }], nextPageToken: 'next' } })
    const get = vi.fn().mockResolvedValue({ data: message() })
    vi.mocked(getGmailClient).mockResolvedValue({ users: { messages: { list, get } } } as unknown as Awaited<
      ReturnType<typeof getGmailClient>
    >)
    expect(await listGmailMessages('user-1')).toEqual({ messages: [], nextPageToken: 'next' })
  })
  it('includes parsed fields in the list without returning the full body', async () => {
    const list = vi.fn().mockResolvedValue({ data: { messages: [{ id: 'one' }] } })
    const get = vi.fn().mockResolvedValue({
      data: message({
        ...part('Ngày giờ giao dịch 26/09/2026, 14:43:55\nSố tiền -21.000 đ\nPhí giao dịch 0 đ'),
        headers: [{ name: 'Subject', value: '[CAKE] Thông báo giao dịch thành công' }],
      }),
    })
    vi.mocked(getGmailClient).mockResolvedValue({ users: { messages: { list, get } } } as unknown as Awaited<
      ReturnType<typeof getGmailClient>
    >)
    const page = await listGmailMessages('user-1')
    expect(page.messages[0].transaction).toEqual({
      source: 'cake',
      amount: -21000,
      occurredAt: '2026-09-26T07:43:55.000Z',
    })
    expect(page.messages[0]).not.toHaveProperty('body')
  })
  it('handles empty inboxes and preserves permission errors', async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: { messages: [{ id: 'one' }] } })
    const denied = { response: { status: 403 } }
    const get = vi.fn().mockRejectedValue(denied)
    vi.mocked(getGmailClient).mockResolvedValue({ users: { messages: { list, get } } } as unknown as Awaited<
      ReturnType<typeof getGmailClient>
    >)
    expect(await listGmailMessages('user-1')).toEqual({ messages: [], nextPageToken: null })
    await expect(listGmailMessages('user-1')).rejects.toBe(denied)
  })
})
